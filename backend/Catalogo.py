import os
import pymysql
from flask import Blueprint, jsonify, current_app, request
from bd import obtener_conexion

catalogo_bp = Blueprint('catalogo_bp', __name__)


def _dict_cursor(conn):
    # Helper to obtain a dict cursor for pymysql connection
    return conn.cursor(pymysql.cursors.DictCursor)


@catalogo_bp.route('/api/publicaciones', methods=['GET'])
def api_publicaciones():
    """Devuelve publicaciones desde la vista `vista_publicaciones`.
    Usa la conexión estándar de `bd.obtener_conexion`.
    """
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id_publicacion, descripcion_publicacion, estado, tipo_publicacion, fecha_publicacion, id_prenda, nombre_prenda, descripcion_prenda, talla, foto, valor, id_usuario FROM vista_publicaciones WHERE estado = 'Disponible' ORDER BY fecha_publicacion DESC")
            publicaciones = cursor.fetchall()

        # Construir URL pública para cada foto usando el host de la petición
        base_url = request.host_url.rstrip('/')
        for p in publicaciones:
            if p.get('foto'):
                p['foto_url'] = f"{base_url}/uploads/{p['foto']}"

        return jsonify({"ok": True, "publicaciones": publicaciones}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        conexion.close()
