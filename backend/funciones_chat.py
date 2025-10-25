from bd import obtener_conexion
from mongodb import connectionBD
from datetime import datetime

def get_usuarios():
    try:
        conexion = obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("SELECT id_usuario, nombre FROM usuarios")
            usuarios = cursor.fetchall()
        conexion.close()
        return usuarios
    except Exception as e:
        print(f"Error al traer usuarios: {e}")
        return []


# --- Funciones del chat ---
def procesar_form_chat(id_remitente, id_destinatario, mensaje):
    try:
        collection = connectionBD()
        nuevo_mensaje = {
            "id_remitente": id_remitente,
            "id_destinatario": id_destinatario,
            "mensaje": mensaje,
            "fecha_mensaje": datetime.now()
        }
        result = collection.insert_one(nuevo_mensaje)
        return bool(result.inserted_id)
    except Exception as e:
        print(f"Error al insertar mensaje: {e}")
        return False


def lista_mensajes_chat(id_remitente, id_destinatario):
    try:
        collection = connectionBD()
        # Traer mensajes entre dos usuarios (conversación)
        mensajes = collection.find({
            "$or": [
                {"id_remitente": id_remitente, "id_destinatario": id_destinatario},
                {"id_remitente": id_destinatario, "id_destinatario": id_remitente}
            ]
        }).sort("fecha_mensaje", 1)

        usuarios = {u["id_usuario"]: u["nombre"] for u in get_usuarios()}

        lista_chat = []
        for msg in mensajes:
            lista_chat.append({
                "remitente": usuarios.get(msg["id_remitente"], "Desconocido"),
                "destinatario": usuarios.get(msg["id_destinatario"], "Desconocido"),
                "mensaje": msg["mensaje"],
                "fecha": msg["fecha_mensaje"].strftime("%d-%m-%Y %H:%M")
            })
        return lista_chat
    except Exception as e:
        print(f"Error listando chat: {e}")
        return []
