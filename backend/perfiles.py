from flask import Blueprint, request, session, jsonify, send_from_directory, current_app
import os
from bd import obtener_conexion

# ==================== CONFIGURACIÓN ====================
perfiles_bp = Blueprint('perfiles', __name__)

def _get_upload_folder():
    uf = current_app.config.get('UPLOAD_FOLDER') if current_app else None
    if not uf:
        uf = os.path.join(os.getcwd(), "uploads")
    os.makedirs(uf, exist_ok=True)
    return uf


# ==================== QUERIES ====================
def otros_perfil(id_usuario):
    """Obtiene las publicaciones y datos básicos de un usuario desde la vista vista_otros_perfiles."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    id_usuario,
                    PrimerNombre,
                    SegundoNombre,
                    PrimerApellido,
                    username_usuario,
                    foto_usuario,
                    id_publicacion,
                    id_prenda,
                    nombre_prenda,
                    foto_prenda,
                    promedio_valoracion
                FROM vista_otros_perfiles
                WHERE id_usuario = %s
                """,
                (id_usuario,)
            )
            filas = cursor.fetchall()
            columnas = [desc[0] for desc in cursor.description]
            return [dict(zip(columnas, fila)) for fila in filas]
    finally:
        conexion.close()


def ef_valoracion_usuario(id_usuario):
    """Calcula el promedio de valoraciones de un usuario."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    u.id_usuario,
                    u.primer_nombre AS PrimerNombre,
                    u.segundo_nombre AS SegundoNombre,
                    AVG(v.puntaje) AS promedio_valoracion
                FROM usuario u
                LEFT JOIN valoracion v 
                       ON u.id_usuario = v.usuario_valorado_id
                WHERE u.id_usuario = %s
                GROUP BY u.id_usuario, u.primer_nombre, u.segundo_nombre
                """,
                (id_usuario,)
            )
            filas = cursor.fetchall()
            columnas = [desc[0] for desc in cursor.description]
            return [dict(zip(columnas, fila)) for fila in filas]
    finally:
        conexion.close()


def insertar_valoracion(usuario_valorado_id, puntaje):
    """Inserta una valoración para un usuario."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO valoracion (usuario_valorado_id, puntaje) 
                VALUES (%s, %s)
                """,
                (usuario_valorado_id, puntaje)
            )
        conexion.commit()
    finally:
        conexion.close()


# ==================== HELPERS ====================
def obtener_datos_perfil(id_usuario):
    """Arma la respuesta JSON del perfil con sus prendas y valoración promedio."""
    datos_perfil = otros_perfil(id_usuario)
    promedio = ef_valoracion_usuario(id_usuario)
    promedio_valoracion = promedio[0]['promedio_valoracion'] if promedio else 0

    if not datos_perfil:
        # Si el usuario no tiene publicaciones, devolver solo su información básica
        perfil = {
            "id_usuario": id_usuario,
            "PrimerNombre": "Usuario",
            "SegundoNombre": "",
            "username_usuario": "usuario_ejemplo",
            "foto_usuario": "default.jpg",
            "promedio_valoracion": promedio_valoracion,
            "prendas": []
        }
    else:
        # Agrupar datos de usuario y prendas
        perfil = {
            "id_usuario": datos_perfil[0]["id_usuario"],
            "PrimerNombre": datos_perfil[0]["PrimerNombre"],
            "SegundoNombre": datos_perfil[0]["SegundoNombre"],
            "PrimerApellido": datos_perfil[0].get("PrimerApellido", ""),
            "username_usuario": datos_perfil[0]["username_usuario"],
            "foto_usuario": datos_perfil[0]["foto_usuario"],
            "promedio_valoracion": promedio_valoracion,
            "prendas": []
        }

        for p in datos_perfil:
            if p["id_prenda"] is not None:
                perfil["prendas"].append({
                    "id_prenda": p["id_prenda"],
                    "id_publicacion": p["id_publicacion"],
                    "nombre_prenda": p["nombre_prenda"],
                    "foto_prenda": p["foto_prenda"],
                    "promedio_valoracion": promedio_valoracion
                })

    return jsonify({"perfil": perfil})


# ==================== RUTAS ====================
@perfiles_bp.route("/api/perfil_usuario", methods=["GET"])
def ver_perfil_usuario():
    """Perfil del usuario autenticado (requiere sesión)."""
    id_usuario = session.get("id_usuario")
    if not id_usuario:
        return jsonify({"error": "No autenticado"}), 401
    return obtener_datos_perfil(id_usuario)


@perfiles_bp.route("/api/perfil_usuario/<int:id_usuario>", methods=["GET"])
def ver_perfil_otro_usuario(id_usuario):
    """Perfil de otro usuario (por ejemplo, el dueño de una prenda)."""
    return obtener_datos_perfil(id_usuario)


@perfiles_bp.route("/api/guardar_valoracion", methods=["POST"])
def guardar_valoracion():
    """Guarda una valoración hacia un usuario."""
    data = request.get_json()
    usuario_valorado_id = data.get("usuario_valorado_id")
    puntaje = data.get("puntaje")

    if not usuario_valorado_id or puntaje is None:
        return jsonify({"error": "Datos incompletos"}), 400

    insertar_valoracion(usuario_valorado_id, puntaje)
    return jsonify({"mensaje": "Valoración guardada con éxito"})


@perfiles_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Sirve imágenes de la carpeta uploads."""
    upload_folder = _get_upload_folder()
    return send_from_directory(upload_folder, filename)
