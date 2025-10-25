from flask import Blueprint, send_file, jsonify
from bd import obtener_conexion
import pymysql
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import io

prendas_caras_vs_economicas_bp = Blueprint('prendas_caras_vs_economicas_bp', __name__)

@prendas_caras_vs_economicas_bp.route('/api/reportes/caro_vs_economico', methods=['GET'])
def generar_reporte_prendas_caro_vs_economico():
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            # La tabla 'prenda' no parece tener columna id_usuario en algunas esquemas;
            # enlazamos con usuario a través de la tabla publicacion si es necesario.
            cursor.execute("""
                (
                 SELECT 
                    'Caras' AS tipo,
                    pr.id_prenda,
                    pr.nombre AS nombre_prenda,
                    pr.valor,
                    u.username AS usuario
                FROM prenda pr
                JOIN publicacion pub ON pr.id_publicacion = pub.id_publicacion
                JOIN usuario u ON pub.id_usuario = u.id_usuario
                ORDER BY pr.valor DESC
                         )
                    UNION ALL
                    (
                     SELECT 
                        'Económicas' AS tipo,
                        pr.id_prenda,
                        pr.nombre AS nombre_prenda,
                        pr.valor,
                        u.username AS usuario
                    FROM prenda pr
                    JOIN publicacion pub ON pr.id_publicacion = pub.id_publicacion
                    JOIN usuario u ON pub.id_usuario = u.id_usuario
                    ORDER BY pr.valor ASC
             )

            """)
            resultados = cursor.fetchall()
    finally:
        conexion.close()

    if not resultados:
        return jsonify({"ok": False, "mensaje": "No hay datos de precios"}), 404

    # Crear PDF en memoria
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elementos = []

    estilos = getSampleStyleSheet()
    titulo = Paragraph("Prendas Caras VS Económicas", estilos['Title'])
    elementos.append(titulo)
    elementos.append(Spacer(1, 20))

    # Crear tabla con las columnas que devuelve la consulta
    data = [["Tipo", "ID Prenda", "Nombre", "Valor", "Usuario"]]
    for r in resultados:
        data.append([r.get('tipo'), r.get('id_prenda'), r.get('nombre_prenda'), r.get('valor'), r.get('usuario')])
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
    return send_file(buffer, as_attachment=True, download_name="reporte_prendas_caras_vs_economicas.pdf", mimetype="application/pdf")


@prendas_caras_vs_economicas_bp.route('/api/reportes/caro_vs_economico/json', methods=['GET'])
def generar_reporte_prendas_caro_vs_economico_json():
    """Endpoint diagnóstico: devuelve la consulta como JSON."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                (
                 SELECT 
                    'Caras' AS tipo,
                    pr.id_prenda,
                    pr.nombre AS nombre_prenda,
                    pr.valor,
                    u.username AS usuario
                FROM prenda pr
                JOIN publicacion pub ON pr.id_publicacion = pub.id_publicacion
                JOIN usuario u ON pub.id_usuario = u.id_usuario
                ORDER BY pr.valor DESC
                         )
                    UNION ALL
                    (
                     SELECT 
                        'Económicas' AS tipo,
                        pr.id_prenda,
                        pr.nombre AS nombre_prenda,
                        pr.valor,
                        u.username AS usuario
                    FROM prenda pr
                    JOIN publicacion pub ON pr.id_publicacion = pub.id_publicacion
                    JOIN usuario u ON pub.id_usuario = u.id_usuario
                    ORDER BY pr.valor ASC
             )

            """)
            resultados = cursor.fetchall()
    finally:
        conexion.close()

    if not resultados:
        return jsonify({"ok": False, "mensaje": "No hay datos de precios"}), 404

    return jsonify({"ok": True, "datos": resultados})
