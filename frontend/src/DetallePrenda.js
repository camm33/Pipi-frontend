import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetallePrenda.css";

function DetallePrenda() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [prenda, setPrenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetalle = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/detalle_prenda/${id}`); // ✅ corregido
        if (!res.ok) throw new Error("Error al obtener detalle de la prenda");

        const data = await res.json();
        const detalle = data.prenda && data.prenda.length > 0 ? data.prenda[0] : null;
        setPrenda(detalle);
      } catch (err) {
        setError("No se pudo cargar la prenda");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (loading) return <p>Cargando detalle...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!prenda) return <p>No se encontró la prenda.</p>;

  const fotos = [prenda.foto, prenda.foto2, prenda.foto3, prenda.foto4].filter(Boolean);

  return (
    <div className="detalle-prenda-container">
      <div className="detalle-prenda-titulo">DETALLE DE PRENDA</div>
      <div className="detalle-prenda-info">
        <div className="detalle-prenda-fotos">
          {fotos.map((foto, index) => (
            <img
              key={index}
              src={`http://localhost:5000/uploads/${foto}`} // ✅ corregido
              alt="" 
              className="detalle-prenda-foto"
            />
          ))}
        </div>
        <div className="detalle-prenda-datos">
          <div className="detalle-prenda-publicador">
            <span>Publicado por:</span>
            <button
              onClick={() => navigate(`/perfil/${prenda.id_usuario}`)} // ✅ corregido
              className="detalle-prenda-publicador-btn"
              title="Ver perfil de usuario"
            >
              <span style={{ fontSize: '18px' }}>👤</span> {prenda.username}
            </button>
          </div>
          <div className="detalle-prenda-label">Nombre</div>
          <div className="detalle-prenda-campo">{prenda.nombre}</div>
          <div className="detalle-prenda-label">Descripción</div>
          <div className="detalle-prenda-campo">{prenda.descripcion}</div>
          <div className="detalle-prenda-label">Talla</div>
          <div className="detalle-prenda-campo">{prenda.talla}</div>
          <div className="detalle-prenda-label">Valor</div>
          <div className="detalle-prenda-campo">${prenda.valor}</div>
          <div className="detalle-prenda-label">Tipo de publicación</div>
          <div className="detalle-prenda-campo">{prenda.tipo_publicacion}</div>
          <div className="detalle-prenda-label">Estado</div>
          <div className="detalle-prenda-campo">
            {prenda.estado ? prenda.estado : "Sin especificar"}
          </div>
        </div>
      </div>

      <button
        className="volver-btn"
        title="Volver al Catálogo"
        onClick={() => navigate('/catalogo')}
      >
        ←
      </button>
    </div>
  );
}

export default DetallePrenda;
