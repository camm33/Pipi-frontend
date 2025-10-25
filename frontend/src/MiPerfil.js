import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./perfiles.css";

function MiPerfil() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [perfil, setPerfil] = useState(null);

  const BACKEND_URL = "http://localhost:5000";

  // 🔹 Cargar datos del perfil al montar el componente
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/mi_perfil`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar el perfil");
        return res.json();
      })
      .then((data) => {
        console.log("📥 Datos del perfil:", data);

        if (data.perfil && data.perfil.length > 0) {
          const usuario = data.perfil[0];
          setPerfil(usuario);
          setRating(usuario.promedio_valoracion || 0);
        } else if (data.perfil) {
          setPerfil(data.perfil);
          setRating(data.perfil.promedio_valoracion || 0);
        }
      })
      .catch((err) => console.error("❌ Error al cargar el perfil:", err));
  }, []);

  // 🔹 Renderizar estrellas
  const renderStars = (promedio) => {
    const rounded = Math.round(promedio);
    return (
      <span className="stars-text">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`star-black ${i <= rounded ? "active" : ""}`}>
            {i <= rounded ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  // 🔹 Render principal
  return (
    <div className="app">
      <main className="app-main">
        {perfil ? (
          <>
            {/* Columna izquierda: datos del usuario */}
            <div className="perfil">
              <div className="Marco">
                <img
                  src={
                    perfil.foto_usuario
                      ? `${BACKEND_URL}/uploads${
                          perfil.foto_usuario.startsWith("/")
                            ? perfil.foto_usuario
                            : "/" + perfil.foto_usuario
                        }`
                      : "/default-user.png"
                  }
                  alt="Foto del usuario"
                  className="foto-usuario"
                />
              </div>

              <p>
                <strong>Promedio de valoración:</strong> {renderStars(rating)}
              </p>

              <div className="datos">
                <p>
                  <strong>Username:</strong>{" "}
                  {perfil.username_usuario || "No disponible"}
                </p>
                <p>
                  <strong>Nombre:</strong>{" "}
                  {perfil.nombre_usuario || "No disponible"}
                </p>
              </div>
            </div>

            {/* Columna derecha: publicaciones del usuario */}
            <div className="publicaciones">
              <h3>Prendas publicadas</h3>
              <div className="cards">
                {perfil.prendas && perfil.prendas.length > 0 ? (
                  perfil.prendas.map((prenda) => (
                    <div
                      className="card"
                      key={prenda.id_prenda}
                      onClick={() =>
                        navigate(`/gestion_prendas/${prenda.id_prenda}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h4>{prenda.nombre_prenda}</h4>
                      <img
                        src={
                          prenda.foto_prenda
                            ? `${BACKEND_URL}/uploads/${prenda.foto_prenda}`
                            : "/default-prenda.png"
                        }
                        alt={prenda.nombre_prenda}
                        className="foto-prenda"
                      />
                    </div>
                  ))
                ) : (
                  <p>No hay prendas para mostrar</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Cargando perfil...</p>
        )}
      </main>

      {/* 🔹 Botones de acción */}
      <div className="botones-navegacion">
        <button
          className="editar-perfil-btn"
          onClick={() => navigate("/editar")}
          title="Editar perfil"
        >
          ✏️ Editar Perfil
        </button>

        <button
          className="volver-btn"
          title="Volver al Catálogo"
          onClick={() => navigate("/catalogo")}
        >
          ← Catálogo
        </button>
      </div>
    </div>
  );
}

export default MiPerfil;
