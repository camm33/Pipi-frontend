import pymysql

def obtener_conexion():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='Double_P',
    )
