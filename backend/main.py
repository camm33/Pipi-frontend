from flask import Flask, render_template, request, redirect, flash, session, url_for
import backend.controlador_almacenado as controlador_almacenado
import os
import json
from flask_dance.contrib.google import make_google_blueprint, google
from backend.bd import obtener_conexion
from pymysql.cursors import DictCursor

# ============================
# Configuración de la app
# ============================
app = Flask(__name__)
app.secret_key = "FFCD"

from flask import Flask, render_template, request, redirect, session, url_for
import os, json
from flask_dance.contrib.google import make_google_blueprint, google
from backend.bd import obtener_conexion
from pymysql.cursors import DictCursor
import backend.controlador_almacenado as controlador_almacenado
import bcrypt
from backend.login import register_bp   # Importamos el blueprint de registro # Importamos el blueprint de perfiles

# ============================
# Configuración
# ============================
app = Flask(__name__)
app.register_blueprint(register_bp)  # Usamos el módulo register

# ============================
# Configuración Google OAuth
# ============================
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

with open("client_secret.json") as f:
    google_config = json.load(f)

google_bp = make_google_blueprint(
    client_id=google_config["web"]["client_id"],
    client_secret=google_config["web"]["client_secret"],
    scope=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
    ],
    redirect_to="google_login"
)
app.register_blueprint(google_bp, url_prefix="/login")

# ============================
# Login con Google
# ============================
@app.route('/google-login')
def google_login():
    if not google.authorized:
        return redirect(url_for("google.login"))

    resp = google.get("/oauth2/v2/userinfo")
    if resp.ok:
        user_info = resp.json()
        session["logueado"] = True
        session["usuario_google"] = user_info
        return render_template("admin.html")  # Ir directo al panel admin

    return redirect(url_for('login'))

# ============================
# Cerrar sesión
    return render_template("admin.html")
    return redirect(url_for('login'))

# ============================
# Logout
# ============================
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ============================
# Login manual
# ============================
@app.route('/login-acceso', methods=['POST'])
def login_acceso():
    if 'username' in request.form and 'password' in request.form:
        usuario = request.form['username']
        contrasena = request.form['password']

        conexion = obtener_conexion()
        cursor = conexion.cursor(DictCursor)
        cursor.execute("""
            SELECT * FROM usuario 
            WHERE (email = %s OR user_name = %s) AND contrasena = %s
            WHERE (email = %s OR username = %s) AND contrasena = %s
        """, (usuario, usuario, contrasena))
        account = cursor.fetchone()
        cursor.close()
        conexion.close()

        if account:
            session['logueado'] = True
            session['id_usuario'] = account['id_usuario']
            return render_template("admin.html")  # Ir directo al panel admin
            return render_template("admin.html")
        else:
            return render_template('login.html', mensaje="Credenciales incorrectas")
    return redirect(url_for('login'))

# ============================
# Rutas principales
# ============================
@app.route("/guardado")
def mensaje_guardado():
    return render_template("guardado.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/")
def inicio():
    return render_template("register.html")

@app.route("/register", methods=["POST"])
def registrar():
    nombre = request.form["nombre"]
    user_name = request.form["user_name"]
    email = request.form["email"]
    contrasena = request.form["contrasena"]
    talla = request.form["talla"]
    fecha_nacimiento = request.form["fecha_nacimiento"]
    foto = request.files["foto"]
    id_rol = 2
    # Hashear la contraseña antes de guardar
    hashed = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    controlador_almacenado.insertar_usuario(nombre, user_name, email, hashed, talla, fecha_nacimiento, foto, id_rol)
    return render_template("login.html")

# ============================
# CRUD PUBLICACIÓN
# ============================
# CRUDs
# ============================
@app.route("/agregar_publicacion")
def formulario_agregar_publicacion():
    return render_template("agregar_publicacion.html")

@app.route("/guardar_publicacion", methods=["POST"])
def guardar_publicacion():
    descripcion = request.form["descripcion"]
    estado = request.form["estado"]
    tipo_publicacion = request.form["tipo"]
    fecha_publicacion = request.form["fecha"]
    id_usuario = session.get("id_usuario", 1)
    controlador_almacenado.insertar_publicacion(descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario)
    return redirect("/guardado")

# ============================
# CRUD PRENDA
# ============================
@app.route("/agregar_prenda")
def formulario_agregar_prenda():
    return render_template("agregar_prenda.html")

@app.route("/guardar_prenda", methods=["POST"])
def guardar_prenda():
    nombre = request.form["nombre"]
    descripcion_prenda = request.form["descripcion"]
    talla = request.form["talla"]
    foto = request.form["foto"]
    valor = request.form["valor"]
    id_publicacion = request.form["publicacion"]
    controlador_almacenado.insertar_prenda(nombre, descripcion_prenda, talla, foto, valor, id_publicacion)
    return redirect("/guardado")

# ============================
# CRUD MENSAJE
# ============================
@app.route("/agregar_mensaje")
def formulario_agregar_mensaje():
    return render_template("agregar_mensaje.html")

@app.route("/guardar_mensaje", methods=["POST"])
def guardar_mensaje():
    id_emisor = request.form["emisor"]
    id_receptor = request.form["receptor"]
    contenido = request.form["contenido"]
    fecha_envio = request.form["fecha"]
    controlador_almacenado.insertar_mensaje(id_emisor, id_receptor, contenido, fecha_envio)
    return redirect("/guardado")

# ============================
# CRUD ROL
# ============================
@app.route("/agregar_rol")
def formulario_agregar_rol():
    return render_template("agregar_rol.html")

@app.route("/guardar_rol", methods=["POST"])
def guardar_rol():
    nom_rol = request.form["tipo"]
    controlador_almacenado.insertar_rol(nom_rol)
    return redirect("/guardado")

# ============================
# CRUD USUARIO
# ============================
@app.route("/agregar_usuario")
def formulario_agregar_usuario():
    return render_template("agregar_usuario.html")

@app.route("/guardar_usuario", methods=["POST"])
def guardar_usuario():
    nombre = request.form["nombre"]
    user_name = request.form["user_name"]
    email = request.form["email"]
    contrasena = request.form["contrasena"]
    talla = request.form["talla"]
    fecha_nacimiento = request.form["fecha_nacimiento"]
    foto = request.form["foto"]
    id_rol = request.form["id_rol"]
    hashed = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    controlador_almacenado.insertar_usuario(nombre, user_name, email, hashed, talla, fecha_nacimiento, foto, id_rol)
    return redirect("/guardado")

# ============================
# CRUD PAGO
# ============================
@app.route("/agregar_pago")
def formulario_pago():
    return render_template("agregar_pago.html")

@app.route("/guardar_pago", methods=["POST"])
def guardar_pago():
    id_usuario = request.form["id_usuario"]
    id_publicacion = request.form["id_publicacion"]
    monto = request.form["monto"]
    metodo_pago = request.form["metodo_pago"]
    estado_pago = request.form["estado_pago"]
    fecha_pago = request.form["fecha_pago"]
    controlador_almacenado.insertar_pago(id_usuario, id_publicacion, monto, metodo_pago, estado_pago, fecha_pago)
    return redirect("/guardado")

# ============================
# CRUD VALORACIÓN
# ============================
@app.route("/agregar_valoracion")
def formulario_valoracion():
    return render_template("agregar_valoracion.html")

@app.route("/guardar_valoracion", methods=["POST"])
def guardar_valoracion():
    usuario_valorador_id = request.form["usuario_valorador_id"]
    usuario_valorado_id = request.form["usuario_valorado_id"]
    puntaje = request.form["puntaje"]
    controlador_almacenado.insertar_valoracion(usuario_valorador_id, usuario_valorado_id, puntaje)
    return redirect("/guardado")
# ... aquí van todos los demás CRUDs (prenda, mensaje, rol, usuario, pago, valoración)

if __name__ == "__main__":
    app.run(debug=True)
