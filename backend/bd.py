import os
import pymysql


def obtener_conexion():
    """Obtiene una conexión a la base de datos usando variables de entorno
    (útil para no hardcodear la contraseña en local). Si no existen las
    variables, usa valores por defecto.
    """
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", os.getenv("DB_PASSWORD", "3107")),
        database=os.getenv("MYSQL_DB", "Double_P"),
    )
