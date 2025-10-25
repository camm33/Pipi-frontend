import smtplib
import pymysql
from bd import obtener_conexion  # tu función de conexión
from flask import Blueprint, request, jsonify

mensaje_bp = Blueprint('mensaje_bp', __name__)


class Mensaje:

    # Configuración de correo
    EMAIL = "appdoublepp@gmail.com"
    PASSWORD = "vxkxvzcbzuanhzgt"

    def __init__(self):
        pass

    def enviar_correo(self, destinatarios, texto):
        """destinatarios: string o lista de correos"""
        if isinstance(destinatarios, str):
            destinatarios = [destinatarios]

        if not destinatarios:
            return "No hay destinatarios válidos."

        message = f"Subject: Notificacion\n\n{texto}"

        try:
            enviar = smtplib.SMTP("smtp.gmail.com", 587)
            enviar.starttls()
            enviar.login(self.EMAIL, self.PASSWORD)

            for recipient in destinatarios:
                enviar.sendmail(self.EMAIL, recipient, message)

            enviar.quit()
            return f"Correo enviado a {', '.join(destinatarios)}"
        except Exception as e:
            return f"Error al enviar el correo: {e}"

    def enviar_a_todos(self, texto):
        """Enviar correo a todos los usuarios de la tabla usuario"""
        correos = self.obtener_todos_los_correos()
        if not correos:
            return "No hay usuarios con correo."
        return self.enviar_correo(correos, texto)

    def obtener_todos_los_correos(self):
        conexion = obtener_conexion()
        correos = []
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT email FROM usuario")
                resultados = cursor.fetchall()
                # resultados puede venir como lista de tuplas
                correos = [r[0] for r in resultados if r and r[0]]
        finally:
            conexion.close()
        return correos


# --- Rutas API para administrar envíos de correo ---
@mensaje_bp.route('/api/enviar_correo', methods=['POST'])
def api_enviar_correo():
    data = request.get_json() or {}
    correo = data.get('correo')
    mensaje_texto = data.get('mensaje')
    enviar_todos = data.get('enviar_todos', False)

    servicio = Mensaje()

    if enviar_todos:
        resultado = servicio.enviar_a_todos(mensaje_texto)
        return jsonify({'ok': True, 'resultado': resultado})

    if not correo:
        return jsonify({'ok': False, 'resultado': 'No se proporcionó correo'}), 400

    resultado = servicio.enviar_correo(correo, mensaje_texto)
    return jsonify({'ok': True, 'resultado': resultado})


@mensaje_bp.route('/api/usuarios_emails', methods=['GET'])
def api_usuarios_emails():
    servicio = Mensaje()
    correos = servicio.obtener_todos_los_correos()
    return jsonify({'ok': True, 'emails': correos})
