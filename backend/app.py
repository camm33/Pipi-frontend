from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from flask_mysqldb import MySQL
from flask_mail import Mail



# Crear la app Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Configuración de sesión y cookies
app.secret_key = "clave_secreta_super_segura"

# Para desarrollo local sin HTTPS, usa estas configuraciones:
# Para desarrollo local sin HTTPS, usa estas configuraciones:
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"    # 'None' requiere secure=True y HTTPS
app.config["SESSION_COOKIE_SECURE"] = False      # True solo con HTTPS

# Carpeta para uploads: usar la carpeta backend/uploads (más aislada que static)
BACKEND_DIR = os.path.dirname(__file__)
UPLOAD_FOLDER = os.path.join(BACKEND_DIR, "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Crear carpeta uploads si no existe
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Durante el desarrollo, permitir que /register devuelva el token para pruebas locales
app.config["DEBUG_TOKEN_IN_RESPONSE"] = True


# Ruta para servir archivos subidos desde backend/uploads
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)



# Configuración MySQL
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "Double_P"

mysql = MySQL(app)

# Configuración correo
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "appdoublepp@gmail.com"
app.config["MAIL_PASSWORD"] = "ssun pbmt motb lmxx"
app.config["MAIL_DEFAULT_SENDER"] = "appdoublepp@gmail.com"

mail = Mail(app)

# Importar y registrar Blueprints
from perfiles import perfiles_bp
from login import login_bp
from detalle_prenda import detalle_prenda_bp
from agregar_publicacion import agregar_publicacion_bp
from admin_home import admin_home_bp
from mi_perfil import mi_perfil_bp
from Editar import editar_perfil_bp  
from gestion_prendas import gestion_prendas_bp
from Catalogo import catalogo_bp
from reportes import estadistica_tallas_bp, prendas_talla_bp, peores_valoraciones_bp, prendas_caras_vs_economicas_bp
from mensaje import mensaje_bp

# Registrar blueprints
app.register_blueprint(perfiles_bp)
app.register_blueprint(login_bp)
app.register_blueprint(detalle_prenda_bp)
app.register_blueprint(agregar_publicacion_bp)
app.register_blueprint(admin_home_bp)
app.register_blueprint(mi_perfil_bp)
app.register_blueprint(editar_perfil_bp)
app.register_blueprint(gestion_prendas_bp)
app.register_blueprint(catalogo_bp)
app.register_blueprint(estadistica_tallas_bp)
app.register_blueprint(prendas_talla_bp)
app.register_blueprint(peores_valoraciones_bp)
app.register_blueprint(prendas_caras_vs_economicas_bp)
app.register_blueprint(mensaje_bp)




# Ejecutar la app
if __name__ == "__main__":
    app.run(debug=True, port=5000)