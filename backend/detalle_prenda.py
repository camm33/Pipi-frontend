import os
import pymysql
from flask import Blueprint, jsonify, current_app
from bd import obtener_conexion

detalle_prenda_bp = Blueprint('detalle_prenda_bp', __name__)

@detalle_prenda_bp.route('/api/publicaciones', methods=['GET'])
def api_publicaciones():
    """
    Devuelve las publicaciones desde la vista SQL 'catalogo'.
    Solo muestra las prendas disponibles.
    """
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                    id_publicacion,
                    tipo_publicacion,
                    id_prenda,
                    nombre_prenda,
                    foto,
                    valor,
                    id_usuario
                FROM catalogo
                ORDER BY id_publicacion DESC
            """)
            publicaciones = cursor.fetchall()

        # 🔹 Agregar URL pública para las fotos (si se configuró un HOST_URL)
        base_url = current_app.config.get('HOST_URL', 'http://localhost:5000')
        for p in publicaciones:
            if p.get('foto'):
                p['foto_url'] = f"{base_url}/uploads/{p['foto']}"

        return jsonify({"ok": True, "publicaciones": publicaciones}), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    finally:
        conexion.close()
