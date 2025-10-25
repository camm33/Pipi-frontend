import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaDeDeseos.css";

export default function ListaDeDeseos() {
  const [deseos, setDeseos] = useState([]);
  const navigate = useNavigate();

  // ✅ Recuperar lista según el usuario en sesión
  useEffect(() => {
    const idUsuario = localStorage.getItem("id_usuario"); // ID del usuario actual
    if (!idUsuario) return;

    const lista = JSON.parse(localStorage.getItem(`lista_deseos_${idUsuario}`)) || [];
    setDeseos(lista);
  }, []);

  // ✅ Ver detalle
  const handleVerMas = (id) => {
    navigate(`/detalle_prenda/${id}`);
  };

  // ✅ Quitar prenda de la lista
  const handleQuitarDeseo = (id_publicacion) => {
    const idUsuario = localStorage.getItem("id_usuario");
    const nuevaLista = deseos.filter((d) => d.id_publicacion !== id_publicacion);
    setDeseos(nuevaLista);
    localStorage.setItem(`lista_deseos_${idUsuario}`, JSON.stringify(nuevaLista));
  };

  // ✅ Volver al catálogo
  const handleVolverCatalogo = () => {
    navigate("/catalogo");
  };

  return (
    <div className="lista-deseos-main">
      <div className="lista-deseos-titulo">LISTA DE DESEOS</div>

      {deseos.length === 0 ? (
        <p className="lista-deseos-vacia">No hay publicaciones en tu lista de deseos.</p>
      ) : (
        <div className="lista-deseos-lista">
          {deseos.map((prod) => (
            <div key={prod.id_publicacion} className="lista-deseos-item">
              <img
                src={`http://localhost:5000/uploads/${prod.foto}`} 
                alt={prod.nombre_prenda}
                className="lista-deseos-img"
              />
              <div className="lista-deseos-info">
                <div className="lista-deseos-nombre">{prod.nombre_prenda}</div>
                <div className="lista-deseos-precio">${prod.valor}</div>
                <button
                  className="lista-deseos-vermas"
                  onClick={() => handleVerMas(prod.id_publicacion)}
                >
                  Ver más
                </button>
              </div>
              <button
                className="lista-deseos-corazon"
                onClick={() => handleQuitarDeseo(prod.id_publicacion)}
                title="Quitar de lista de deseos"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="volver-btn"
        onClick={handleVolverCatalogo}
        title="Volver al catálogo"
      >
        ←
      </button>
    </div>
  );
}
