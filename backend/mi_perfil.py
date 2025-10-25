from flask import Blueprint, session, jsonify, send_from_directory, current_app
from bd import obtener_conexion  # Función para conectar a la base de datos
import os

# ------------------------------
# Blueprint
# ------------------------------
mi_perfil_bp = Blueprint('mi_perfil', __name__)

# ------------------------------
# Carpeta para imágenes
# ------------------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

# ------------------------------
# Función para obtener perfil
# ------------------------------
def obtener_perfil(id_usuario):
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    u.id_usuario,
                    u.primer_nombre AS PrimerNombre,
                    u.segundo_nombre AS SegundoNombre,
                    u.primer_apellido AS PrimerApellido,
                    u.username AS username_usuario,
                    u.foto AS foto_usuario,
                    p.id_publicacion,
                    pr.id_prenda,
                    pr.nombre AS nombre_prenda,
                    pr.foto AS foto_prenda,
                    vv.promedio_valoracion
                FROM usuario u
                LEFT JOIN publicacion p ON u.id_usuario = p.id_usuario
                LEFT JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                LEFT JOIN (
                    SELECT 
                        v.usuario_valorado_id,
                        AVG(v.puntaje) AS promedio_valoracion
                    FROM valoracion v
                    GROUP BY v.usuario_valorado_id
                ) vv ON u.id_usuario = vv.usuario_valorado_id
                WHERE u.id_usuario = %s
                """,
                (id_usuario,)
            )

            filas = cursor.fetchall()
            if not filas:
                return None

            columnas = [desc[0] for desc in cursor.description]
            perfil = [dict(zip(columnas, fila)) for fila in filas]

            # Agrupar datos del usuario
            usuario = {
                'id_usuario': perfil[0]['id_usuario'],
                'PrimerNombre': perfil[0]['PrimerNombre'],
                'SegundoNombre': perfil[0]['SegundoNombre'],
                'PrimerApellido': perfil[0]['PrimerApellido'],
                'username_usuario': perfil[0]['username_usuario'],
                'foto_usuario': perfil[0]['foto_usuario'],
                'promedio_valoracion': perfil[0]['promedio_valoracion'],
                'prendas': []
            }

            # Agregar prendas si existen
            for row in perfil:
                if row['id_prenda'] is not None:
                    usuario['prendas'].append({
                        'id_prenda': row['id_prenda'],
                        'id_publicacion': row['id_publicacion'],
                        'nombre_prenda': row['nombre_prenda'],
                        'foto_prenda': row['foto_prenda'],
                        'promedio_valoracion': row['promedio_valoracion']
                    })

            return usuario

    finally:
        conexion.close()

# ------------------------------
# Endpoint API
# ------------------------------
@mi_perfil_bp.route("/api/mi_perfil")
def api_mi_perfil():
    id_usuario = session.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Usuario no autenticado"}), 401
    
    perfil = obtener_perfil(id_usuario)
    if not perfil:
        return jsonify({"perfil": []})
    
    return jsonify({"perfil": [perfil]})

# ------------------------------
# Servir imágenes
# ------------------------------
@mi_perfil_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
