# chat.py
from flask import Blueprint, request, jsonify
from funciones_chat import procesar_form_chat, lista_mensajes_chat

chat_bp = Blueprint("chat", __name__)

# Obtener mensajes entre dos usuarios
@chat_bp.route("/mensajes", methods=["GET"])
def obtener_mensajes():
    id_remitente = int(request.args.get("id_remitente"))
    id_destinatario = int(request.args.get("id_destinatario"))
    mensajes = lista_mensajes_chat(id_remitente, id_destinatario)
    return jsonify(mensajes)

# Enviar mensaje
@chat_bp.route("/mensajes", methods=["POST"])
def enviar_mensaje():
    data = request.get_json()
    id_remitente = data.get("id_remitente")
    id_destinatario = data.get("id_destinatario")
    mensaje = data.get("mensaje")

    if not id_remitente or not id_destinatario or not mensaje:
        return jsonify({"error": "Faltan datos"}), 400

    exito = procesar_form_chat(id_remitente, id_destinatario, mensaje)
    if exito:
        return jsonify({
            "success": True,
            "mensajes": lista_mensajes_chat(id_remitente, id_destinatario)
        })
    else:
        return jsonify({"success": False, "error": "No se pudo guardar"}), 500
