import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AgregarPublicacion.css";

const AgregarPublicacion = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [valoracion, setValoracion] = useState(0);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [talla, setTalla] = useState("");
  const [valor, setValor] = useState("");
  const [estado, setEstado] = useState("Disponible");
  const [mensaje, setMensaje] = useState("");

  const [fotos, setFotos] = useState([null, null, null, null]);

  const handleStarClick = (num) => {
    setValoracion(num);
  };

  const handleFotoChange = (index, file) => {
    const nuevasFotos = [...fotos];
    nuevasFotos[index] = file;
    setFotos(nuevasFotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("estado", estado);
    formData.append("tipo_publicacion", tipo);
    formData.append("fecha_publicacion", new Date().toISOString().slice(0, 10));
    formData.append("nombre", nombre);
    formData.append("descripcion_prenda", descripcion);
    formData.append("talla", talla);
    formData.append("valor", valor === "" ? "0.00" : valor);
    formData.append("valoracion", valoracion);

    const id_usuario = localStorage.getItem("id_usuario");
    if (id_usuario) formData.append("id_usuario", id_usuario);

    fotos.forEach((foto, i) => {
      if (foto) {
        if (i === 0) formData.append("foto", foto);
        else formData.append(`foto${i + 1}`, foto);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/publicar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMensaje(data.message || "Publicado correctamente ✅");

      // 🔹 Redirigir al Home después de 1 segundo
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      setMensaje("❌ Error al publicar");
      console.error(error);
    }
  };

  const renderPreview = (file) => {
    if (!file) return <span className="upload-label">📤</span>;
    return <img src={URL.createObjectURL(file)} alt="preview" className="preview-img" />;
  };

  return (
    <div className="container">
      <h2 className="titulo">AGREGAR PRENDA</h2>
      <div className="contenido-central">
        {/* FOTOS */}
        <div className="fotos-lado-izquierdo">
          <p className="texto">Agregar fotos de la prenda.</p>
          <div className="fotos-grid">
            {fotos.map((foto, index) => (
              <div className="foto-cuadro" key={index}>
                <input
                  type="file"
                  id={`file${index}`}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => handleFotoChange(index, e.target.files[0] || null)}
                />
                <label htmlFor={`file${index}`} className="upload-label">
                  {renderPreview(foto)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="form-lado-derecho">
          <form onSubmit={handleSubmit}>
            <div className="campo">
              <label>* Nombre:</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="campo">
              <label>Descripción:</label>
              <textarea rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>

            <div className="campo">
              <label>* Talla:</label>
              <input type="text" value={talla} onChange={(e) => setTalla(e.target.value)} required />
            </div>

            <div className="campo tipo-publicacion">
              <label>* Tipo de publicación:</label>
              <button type="button" className={tipo === "Venta" ? "active" : ""} onClick={() => setTipo("Venta")}>
                VENTA
              </button>
              <button type="button" className={tipo === "Intercambio" ? "active" : ""} onClick={() => setTipo("Intercambio")}>
                INTERCAMBIO
              </button>
            </div>

            <div className="campo valor">
              <label>Valor:</label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required={tipo !== "Intercambio"}
                disabled={tipo === "Intercambio"}
                placeholder={tipo === "Intercambio" ? "No aplica para intercambio" : ""}
              />
            </div>

            <div className="campo estado">
              <label>* Estado:</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="Disponible">Disponible</option>
                <option value="No Disponible">No Disponible</option>
              </select>
            </div>

            <div className="campo valoracion">
              <label>* Califica la calidad de la prenda:</label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${valoracion >= star ? "active" : ""}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-publicar">PUBLICAR</button>
          </form>

          {mensaje && <p style={{ marginTop: "1em", color: "green" }}>{mensaje}</p>}
        </div>
      </div>

      {/* Botón volver al catálogo */}
      <div style={{ marginTop: 24 }}>
        <button
          className="volver-btn"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '6px 10px',
            background: '#7c5e2c',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
          title="Volver al Catálogo"
          onClick={() => navigate('/catalogo')}
        >
          ←
        </button>
      </div>
    </div>
  );
};

export default AgregarPublicacion;
