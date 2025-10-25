import pymysql

# ====== CONEXIÓN ======
def obtener_conexion():
    return pymysql.connect(
        host="localhost",
        user="root",      # tu usuario
        password="",      # sin contraseña
        db="double_p",    # tu base de datos
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ====== FUNCIONES EXISTENTES ======

def insertar_rol(nom_rol):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            "INSERT INTO rol (nom_rol) VALUES (%s)",
            (nom_rol,)
        )
    conexion.commit()
    conexion.close()


def insertar_usuario(nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO usuario (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol)
        )
    conexion.commit()
    conexion.close()


def insertar_pago(id_usuario, id_publicacion, monto, metodo_pago, estado_pago, fecha_pago):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO pago (id_usuario, id_publicacion, monto, metodo_pago, estado_pago, fecha_pago)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (id_usuario, id_publicacion, monto, metodo_pago, estado_pago, fecha_pago)
        )
    conexion.commit()
    conexion.close()


def insertar_valoracion(usuario_valorador_id, usuario_valorado_id, puntaje):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            "INSERT INTO valoracion (usuario_valorador_id, usuario_valorado_id, puntaje) VALUES (%s, %s, %s)",
            (usuario_valorador_id, usuario_valorado_id, puntaje)
        )
    conexion.commit()
    conexion.close()


def existe_email(email):
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as count FROM usuario WHERE email = %s", (email,))
            resultado = cursor.fetchone()
            return resultado['count'] > 0  # True si ya existe
    finally:
        conexion.close()


def registrar(nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol):
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO usuario (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol)
            )
        conexion.commit()
        return True
    except Exception as e:
        print("Error al registrar:", e)
        conexion.rollback()
        return False
    finally:
        conexion.close()

