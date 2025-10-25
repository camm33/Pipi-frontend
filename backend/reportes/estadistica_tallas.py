from flask import Blueprint, send_file, jsonify
from bd import obtener_conexion
import pymysql
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io

estadistica_tallas_bp = Blueprint('estadistica_tallas_bp', __name__)

@estadistica_tallas_bp.route('/api/reportes/usuarios_tallas', methods=['GET'])
def generar_reporte_tallas():
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT TRIM(UPPER(talla)) AS talla, COUNT(*) AS total_usuarios
                FROM usuario
                WHERE talla IS NOT NULL AND talla <> ''
                GROUP BY TRIM(UPPER(talla))
                ORDER BY total_usuarios DESC
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
    # Asegurar que exista un estilo 'marca' (algunos cambios anteriores lo eliminaron)
    if 'marca' not in estilos:
        estilos.add(ParagraphStyle(name='marca', fontSize=14, leading=16, spaceAfter=6))
    empresa = Paragraph("Double π", estilos['marca'])
    titulo = Paragraph("Reporte de Usuarios por Talla", estilos['Title'])
    elementos.append(empresa)
    elementos.append(titulo)
    elementos.append(Spacer(1, 20))

    # Crear tabla
    data = [["Talla", "Cantidad de Usuarios"]] + [[r['talla'], r['total_usuarios']] for r in resultados]
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
    return send_file(buffer, as_attachment=True, download_name="reporte_usuarios_tallas.pdf", mimetype="application/pdf")
