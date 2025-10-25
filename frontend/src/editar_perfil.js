import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditarPerfil.css";

function EditarPerfil() {
  const navigate = useNavigate();
  const [talla, setTalla] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [foto, setFoto] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/perfil`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar perfil");
        return res.json();
      })
      .then((data) => {
        setTalla(data.talla || "");
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar perfil:", err);
        setMensaje("❌ Error al cargar perfil");
        setCargando(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    const formData = new FormData();

    // Solo agregar talla si NO está vacío o vacío en blanco
    if (talla.trim() !== "") {
      formData.append("talla", talla.trim());
    }
    // Contraseña si tiene contenido
    if (contrasena.trim() !== "") {
      formData.append("contrasena", contrasena.trim());
    }
    // Foto si está seleccionada
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/perfil`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("✅ Perfil actualizado correctamente");
        setContrasena(""); // limpiar contraseña
      } else {
        setMensaje("❌ Error al actualizar: " + (data.error || "Intenta de nuevo"));
      }
    } catch (error) {
      console.error("❌ Error en envío:", error);
      setMensaje("❌ No se pudo conectar con el servidor");
    }
  };

  if (cargando) return <p className="cargando">Cargando perfil...</p>;

  return (
    <div className="editar-perfil">
      <div className="perfil-card">
        <h3>Editar Perfil</h3>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          autoComplete="off"
        >
          {/* Inputs ocultos para evitar autocompletado indeseado */}
          <input
            type="text"
            name="fakeuser"
            style={{ display: "none" }}
            autoComplete="username"
          />
          <input
            type="password"
            name="fakepass"
            style={{ display: "none" }}
            autoComplete="new-password"
          />

          <div className="form-group">
            <label>Talla:</label>
            <input
              type="text"
              name="talla"
              value={talla}
              onChange={(e) => setTalla(e.target.value)}
              // <-- quitado required para que no sea obligatorio
              autoComplete="off"
              placeholder="Opcional"
            />
          </div>

          <div className="form-group">
            <label>Contraseña nueva:</label>
            <input
              type="password"
              name="contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Deja vacío si no quieres cambiarla"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Foto de perfil:</label>
            <input
              type="file"
              name="foto"
              onChange={(e) => setFoto(e.target.files[0])}
              accept="image/*"
            />
          </div>

          <button type="submit" className="boton-guardar">
            GUARDAR
          </button>

          <button
            type="button"
            className="volver-btn"
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              padding: "6px 10px",
              background: "#7c5e2c",
              color: "white",
              border: "none",
              borderRadius: "50%",
              fontSize: "20px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
            title="Volver al Catálogo"
            onClick={() => navigate("/catalogo")}
          >
            ←
          </button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </div>
  );
}

export default EditarPerfil;
