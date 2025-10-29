from flask import Blueprint, request, jsonify, session, current_app
from flask_mail import Message
import bcrypt
import os
from werkzeug.utils import secure_filename
import MySQLdb.cursors
import random
import re

login_bp = Blueprint("login_bp", __name__)

# ---------- REGISTRO ----------
@login_bp.route('/register', methods=['POST'])
def register():
    try:
        data = None
        foto_filename = None

        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
        else:
            if request.form:
                data = request.form.to_dict()
            foto_file = request.files.get('foto')
            if foto_file and foto_file.filename:
                filename = secure_filename(foto_file.filename)
                upload_folder = current_app.config.get('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))
                os.makedirs(upload_folder, exist_ok=True)
                unique_prefix = str(int(random.random() * 1000000))
                filename = f"{unique_prefix}_{filename}"
                foto_file.save(os.path.join(upload_folder, filename))
                foto_filename = filename

        if not data:
            return jsonify({"success": False, "mensaje": "⚠ No se recibieron datos"}), 400

        primer_nombre = data.get('primer_nombre', '').upper()
        segundo_nombre = data.get('segundo_nombre', '').upper()
        primer_apellido = data.get('primer_apellido', '').upper()
        segundo_apellido = data.get('segundo_apellido', '').upper()
        username = data.get('username', '')
        correo = data.get('email', '')
        password = data.get('contrasena', '')
        talla = data.get('talla', '')
        fecha_nacimiento = data.get('fecha_nacimiento', '')

        if not re.match(r'[^@]+@[^@]+\.[^@]+', correo):
            return jsonify({"success": False, "mensaje": "⚠ Correo inválido"}), 400

        from app import mysql, mail
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuario WHERE email=%s", (correo,))
        if cursor.fetchone():
            return jsonify({"success": False, "mensaje": "⚠ El correo ya está registrado"}), 400

        token = str(random.randint(1000, 9999))

        # --- Correo HTML personalizado de registro ---
        msg = Message(
            subject="🌸 Verificación de cuenta - Double_P",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[correo],
        )

        msg.html = f"""
        <div style="font-family:'Libre Baskerville','Merriweather','Garamond',serif;
                    background-color:#faf7f3; padding:25px; border-radius:12px; border:1px solid #e0cba8; max-width:500px; margin:auto;">
            <h2 style="color:#b68c56; text-align:center;">🌸 ¡Bienvenida a <b>Double π</b>!</h2>
            <p style="font-size:16px; color:#333;">Hola <b>{primer_nombre}</b>, gracias por unirte a nuestra comunidad.</p>
            <p style="font-size:16px; color:#333;">Tu código de verificación es:</p>
            <div style="background-color:#b68c56; color:white; padding:12px; text-align:center;
                        border-radius:8px; font-size:22px; letter-spacing:3px; font-weight:bold;">
                {token}
            </div>
            <p style="font-size:15px; color:#444; margin-top:20px;">
                En Double π creemos que cada cuerpo merece su estilo. 💕  
                Usa este código para confirmar tu cuenta y comenzar a compartir, vender o donar tus prendas favoritas.
            </p>
            <p style="font-size:14px; color:#777; margin-top:20px;">
                Si no solicitaste este registro, puedes ignorar este mensaje.
            </p>
            <hr style="border:none; border-top:1px solid #e8d7b2; margin:20px 0;">
            <p style="text-align:center; color:#999; font-size:12px;">
                © 2025 <b>Double π </b> — Sin límites, sin barreras, más tallas, más de ti ✨
            </p>
        </div>
        """

        mail.send(msg)

        session["registro_temp"] = {
            "primer_nombre": primer_nombre,
            "segundo_nombre": segundo_nombre,
            "primer_apellido": primer_apellido,
            "segundo_apellido": segundo_apellido,
            "username": username,
            "correo": correo,
            "password": password,
            "talla": talla,
            "fecha_nacimiento": fecha_nacimiento,
            "token": token,
            "foto": foto_filename,
        }

        response_payload = {"success": True, "mensaje": "Se envió un token de verificación a tu correo"}
        if current_app.config.get("DEBUG_TOKEN_IN_RESPONSE"):
            response_payload["token"] = token

        return jsonify(response_payload), 200

    except Exception as e:
        print("❌ Error en register:", e)
        return jsonify({"success": False, "mensaje": "❌ Error interno del servidor"}), 500


# ---------- VERIFICAR ----------
@login_bp.route('/verificar', methods=['POST'])
def verificar():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "mensaje": "⚠ No se recibieron datos"}), 400

        email = data.get("email") or data.get("correo")
        token_usuario = data.get("token")

        registro_temp = session.get("registro_temp")
        if registro_temp:
            if email != registro_temp.get("correo"):
                return jsonify({"success": False, "mensaje": "⚠ El correo no coincide"}), 400
            if token_usuario != registro_temp.get("token"):
                return jsonify({"success": False, "mensaje": "❌ Token inválido"}), 400

            from app import mysql
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            foto_nombre = registro_temp.get("foto") if registro_temp.get("foto") else 'default.jpg'

            # Hashear la contraseña con bcrypt antes de guardar
            plain_pw = registro_temp.get("password", "") or ""
            hashed_pw = bcrypt.hashpw(plain_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            cursor.execute(
                """INSERT INTO usuario 
                (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    registro_temp["primer_nombre"],
                    registro_temp["segundo_nombre"],
                    registro_temp["primer_apellido"],
                    registro_temp["segundo_apellido"],
                    registro_temp["username"],
                    registro_temp["correo"],
                    hashed_pw,
                    registro_temp["talla"],
                    registro_temp["fecha_nacimiento"],
                    foto_nombre,
                    2,
                ),
            )
            mysql.connection.commit()
            session.pop("registro_temp", None)

            return jsonify({"success": True, "mensaje": "✅ Cuenta verificada y registrada correctamente"}), 200

        login_temp = session.get("login_temp")
        if login_temp:
            if token_usuario != login_temp.get("token"):
                return jsonify({"success": False, "mensaje": "❌ Token inválido"}), 400

            user_id = login_temp.get("id")
            id_rol = login_temp.get("id_rol")
            session.pop("login_temp", None)

            return jsonify({"success": True, "mensaje": "✅ Verificación de login correcta", "id_usuario": user_id, "id_rol": id_rol}), 200

        return jsonify({"success": False, "mensaje": "⚠ No hay proceso de verificación activo"}), 400

    except Exception as e:
        print("❌ Error en verificar:", e)
        return jsonify({"success": False, "mensaje": "❌ Error interno del servidor"}), 500


# ---------- LOGIN ----------
@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "mensaje": "⚠ No se recibieron datos"}), 400

        usuario_input = data.get('usuario')
        password = data.get('password')

        from app import mysql, mail
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        # Buscar el usuario por email o username y verificar bcrypt en Python
        cursor.execute("SELECT * FROM usuario WHERE email=%s OR username=%s", (usuario_input, usuario_input))
        usuario = cursor.fetchone()
        if not usuario:
            return jsonify({"success": False, "mensaje": "⚠ Usuario o contraseña incorrectos"}), 400

        stored_hash = usuario.get('contrasena')
        if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({"success": False, "mensaje": "⚠ Usuario o contraseña incorrectos"}), 400

        token = str(random.randint(1000, 9999))
        msg = Message(
            subject="🔐 Token de inicio de sesión - Double_P",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[usuario["email"]],
        )

        msg.html = f"""
        <div style="font-family:'Libre Baskerville','Merriweather','Garamond',serif;
                    background-color:#fdf8f2; padding:25px; border-radius:12px; border:1px solid #e0cba8; max-width:480px; margin:auto;">
            <h2 style="color:#b68c56; text-align:center;">🔐 Inicio de sesión en <b>Double π</b></h2>
            <p style="font-size:16px; color:#333;">Hola <b>{usuario['username']}</b>, tu código de inicio de sesión es:</p>
            <div style="background-color:#b68c56; color:white; padding:12px; text-align:center;
                        border-radius:8px; font-size:22px; letter-spacing:3px; font-weight:bold;">
                {token}
            </div>
            <p style="font-size:15px; color:#444; margin-top:20px;">
                Ingresa este código en la aplicación para continuar.  
                En <b>Double π</b> valoramos tu seguridad y queremos asegurarnos de que seas tú 💛
            </p>
            <p style="font-size:14px; color:#777; margin-top:20px;">
                Si no solicitaste iniciar sesión, puedes ignorar este mensaje sin problema.
            </p>
            <hr style="border:none; border-top:1px solid #e8d7b2; margin:20px 0;">
            <p style="text-align:center; color:#999; font-size:12px;">
                © 2025 <b>Double π</b> — Sin límites, sin barreras, más tallas, más de ti ✨
            </p>
        </div>
        """

        mail.send(msg)

        session["login_temp"] = {
            "id": usuario.get("id_usuario"),
            "correo": usuario.get("email"),
            "nombre": usuario.get("primer_nombre"),
            "token": token,
            "id_rol": usuario.get("id_rol"),
        }

        return jsonify({"success": True, "mensaje": "Token enviado al correo"}), 200

    except Exception as e:
        print("❌ Error en login:", e)
        return jsonify({"success": False, "mensaje": "❌ Error interno del servidor"}), 500
