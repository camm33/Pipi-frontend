from flask import Blueprint, send_file, jsonify
from bd import obtener_conexion
import pymysql
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import io

prendas_talla_bp = Blueprint('prendas_talla_bp', __name__)

@prendas_talla_bp.route('/api/reportes/publicaciones_tallas', methods=['GET'])
def generar_reporte_publicaciones_tallas():
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                 p.talla,
                 COUNT(pub.id_publicacion) AS cantidad_publicaciones
                FROM prenda p
                JOIN publicacion pub ON p.id_publicacion = pub.id_publicacion
                GROUP BY p.talla
                ORDER BY cantidad_publicaciones DESC;
            """)
            resultados = cursor.fetchall()
    finally:
        conexion.close()

    if not resultados:
        return jsonify({"ok": False, "mensaje": "No hay datos de tallas"}), 404

    # Crear PDF en memoria
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elementos = []

    estilos = getSampleStyleSheet()
    titulo = Paragraph("Reporte de Publicaciones por Talla", estilos['Title'])
    elementos.append(titulo)
    elementos.append(Spacer(1, 20))

    # Crear tabla
    data = [["Talla", "Cantidad de Publicaciones"]] + [[r['talla'], r['cantidad_publicaciones']] for r in resultados]
    tabla = Table(data, hAlign='CENTER')

    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#b68c56")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))

    elementos.append(tabla)
    doc.build(elementos)

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="reporte_publicaciones_tallas.pdf", mimetype="application/pdf")


@prendas_talla_bp.route('/api/reportes/publicaciones_tallas/json', methods=['GET'])
def generar_reporte_publicaciones_tallas_json():
    """Endpoint de diagnóstico: devuelve los resultados de la consulta como JSON (útil para pruebas)."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                 p.talla,
                 COUNT(pub.id_publicacion) AS cantidad_publicaciones
                FROM prenda p
                JOIN publicacion pub ON p.id_publicacion = pub.id_publicacion
                GROUP BY p.talla
                ORDER BY cantidad_publicaciones DESC;
            """)
            resultados = cursor.fetchall()
    finally:
        conexion.close()

    if not resultados:
        return jsonify({"ok": False, "mensaje": "No hay datos de tallas"}), 404

    return jsonify({"ok": True, "datos": resultados})
