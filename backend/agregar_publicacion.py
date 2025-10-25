
from flask import Blueprint, request, session, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
import time
from bd import obtener_conexion
import os

# ===================== CONFIG =====================
agregar_publicacion_bp = Blueprint('agregar_publicacion', __name__)
# Use the central UPLOAD_FOLDER from the Flask app when available
def _get_upload_folder():
    uf = current_app.config.get('UPLOAD_FOLDER') if current_app else None
    if not uf:
        uf = os.path.join(os.getcwd(), "uploads")
    os.makedirs(uf, exist_ok=True)
    return uf
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ===================== DB FUNC =====================
def crear_publicacion_prenda(
    descripcion, estado, tipo_publicacion, fecha_publicacion,
    id_usuario, nombre, descripcion_prenda, talla,
    foto, foto2, foto3, foto4, valor
):
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.callproc("crear_publicacion_prenda", (
                descripcion,
                estado,
                tipo_publicacion,
                fecha_publicacion,
                id_usuario,
                nombre,
                descripcion_prenda,
                talla,
                foto,
                foto2,
                foto3,
                foto4,
                valor
            ))
            conexion.commit()
    finally:
        conexion.close()


# ===================== API =====================
@agregar_publicacion_bp.route("/publicar", methods=["POST"])
def publicar():

    # Obtener id_usuario del form o de la sesión
    id_usuario = request.form.get("id_usuario")
    if not id_usuario:
        id_usuario = session.get("id_usuario", 1)

    # datos de texto
    descripcion = request.form.get("descripcion")
    estado = request.form.get("estado")
    tipo_publicacion = request.form.get("tipo_publicacion")
    fecha_publicacion = request.form.get("fecha_publicacion")
    nombre = request.form.get("nombre")
    descripcion_prenda = request.form.get("descripcion_prenda")
    talla = request.form.get("talla")
    valor = request.form.get("valor")

    # fotos
    fotos_guardadas = []
    upload_folder = _get_upload_folder()
    for key in ["foto", "foto2", "foto3", "foto4"]:
        file = request.files.get(key)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # make unique to avoid collisions
            unique = f"{int(time.time())}_{filename}"
            filepath = os.path.join(upload_folder, unique)
            file.save(filepath)
            fotos_guardadas.append(unique)
        else:
            fotos_guardadas.append(None)

    try:
        crear_publicacion_prenda(
            descripcion, estado, tipo_publicacion, fecha_publicacion,
            id_usuario, nombre, descripcion_prenda, talla,
            fotos_guardadas[0], fotos_guardadas[1], fotos_guardadas[2], fotos_guardadas[3],
            valor
        )
        return jsonify({"status": "success", "message": "Publicación creada exitosamente 💅"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ===================== SERVIR FOTOS =====================
@agregar_publicacion_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    upload_folder = _get_upload_folder()
    return send_from_directory(upload_folder, filename)




# El Blueprint debe ser registrado en app.py