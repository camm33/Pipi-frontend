from flask import Blueprint, send_file, jsonify
from bd import obtener_conexion
import pymysql
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import io

peores_valoraciones_bp = Blueprint('peores_valoraciones', __name__)

@peores_valoraciones_bp.route('/api/reportes/peores_valoraciones', methods=['GET'])
def generar_reporte_tallas():
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                 u.id_usuario,
                 u.username,
                 v.puntaje
             FROM valoracion v
             INNER JOIN usuario u 
             ON v.usuario_valorado_id = u.id_usuario
             WHERE v.puntaje BETWEEN 1 AND 3
             ORDER BY v.puntaje ASC;
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
    titulo = Paragraph("Reporte de Peores Valoraciones", estilos['Title'])
    elementos.append(titulo)
    elementos.append(Spacer(1, 20))

    # Crear tabla
    data = [["ID Usuario", "Nombre de Usuario", "Puntaje"]] + [[r['id_usuario'], r['username'], r['puntaje']] for r in resultados]
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
    return send_file(buffer, as_attachment=True, download_name="reporte_peores_valoraciones.pdf", mimetype="application/pdf")


@peores_valoraciones_bp.route('/api/reportes/peores_valoraciones/json', methods=['GET'])
def generar_reporte_peores_valoraciones_json():
    """Endpoint de diagnóstico: devuelve los resultados de la consulta como JSON (útil para pruebas)."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT 
                 u.id_usuario,
                 u.username,
                 v.puntaje
             FROM valoracion v
             INNER JOIN usuario u 
             ON v.usuario_valorado_id = u.id_usuario
             WHERE v.puntaje BETWEEN 1 AND 3
             ORDER BY v.puntaje ASC;
            """)
            resultados = cursor.fetchall()
    finally:
        conexion.close()

    if not resultados:
        return jsonify({"ok": False, "mensaje": "No hay datos"}), 404

    return jsonify({"ok": True, "datos": resultados})
