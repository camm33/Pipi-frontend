import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GestionPublicaciones.css";

function GestionPrendas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_prenda: "",
    nombre: "",
    username: "",
    id_usuario: "",
    descripcion: "",
    talla: "",
    tipo_publicacion: "",
    valor: "",
    foto: null,
    foto2: null,
    foto3: null,
    foto4: null,
    foto_actual: "",
    foto2_actual: "",
    foto3_actual: "",
    foto4_actual: "",
  });

  const [preview, setPreview] = useState({
    foto: null,
    foto2: null,
    foto3: null,
    foto4: null,
  });

  // --- Cargar datos desde el backend ---
  useEffect(() => {
    if (!id) return;

    const fetchPrenda = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/detalle_prenda/${id}`);
        const data = await res.json();
        const prenda = data.prenda[0] || {};

        setForm({
          id_prenda: prenda.id_prenda || "",
          nombre: prenda.nombre || "",
          username: prenda.username || "",
          id_usuario: prenda.id_usuario || "",
          descripcion: prenda.descripcion || "",
          talla: prenda.talla || "",
          tipo_publicacion: prenda.tipo_publicacion || "",
          valor: prenda.valor || "",
          foto_actual: prenda.foto || "",
          foto2_actual: prenda.foto2 || "",
          foto3_actual: prenda.foto3 || "",
          foto4_actual: prenda.foto4 || "",
          foto: null,
          foto2: null,
          foto3: null,
          foto4: null,
        });
      } catch (err) {
        alert("Error al cargar la prenda: " + err.message);
      }
    };

    fetchPrenda();
  }, [id]);

  // --- Manejar cambios ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));
      setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Editar prenda ---
  const handleEditar = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });

    try {
      const res = await fetch(`http://localhost:5000/editar/${id}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Editado correctamente");
        navigate("/catalogo");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch {
      alert("❌ Error del servidor");
    }
  };

  // --- Eliminar prenda ---
  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar esta prenda?")) return;
    try {
      const res = await fetch(`http://localhost:5000/eliminar/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Eliminado correctamente");
        navigate("/catalogo");
      } else {
        alert("❌ Error al eliminar");
      }
    } catch {
      alert("❌ Error del servidor");
    }
  };

  // --- Render fotos ---
  const renderFoto = (num) => {
    const key = `foto${num === 1 ? "" : num}`;
    const actual = form[`${key}_actual`];
    const previewUrl = preview[key];

    return (
      <div key={key} className="foto-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={`preview ${key}`} />
        ) : actual ? (
          <img src={`http://localhost:5000/uploads/${actual}`} alt={actual} />
        ) : (
          <div className="foto-placeholder">No hay foto</div>
        )}
        <input type="file" name={key} accept="image/*" onChange={handleChange} />
      </div>
    );
  };

  return (
    <div className="editar-container">
      <div className="editar-panel">
        <div className="editar-fotos">
          
          {[1, 2, 3, 4].map((num) => renderFoto(num))}
        </div>

        <form className="editar-formulario" onSubmit={handleEditar}>
          <h2>EDITAR PRENDA</h2>

          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
          />
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
          />
          <input
            type="text"
            name="talla"
            value={form.talla}
            onChange={handleChange}
            placeholder="Talla"
          />
          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            placeholder="Valor"
          />

          {/* Campos ocultos */}
          <input type="hidden" name="foto_actual" value={form.foto_actual} />
          <input type="hidden" name="foto2_actual" value={form.foto2_actual} />
          <input type="hidden" name="foto3_actual" value={form.foto3_actual} />
          <input type="hidden" name="foto4_actual" value={form.foto4_actual} />

          <div className="editar-botones">
            <button type="submit" className="btn-accion">
              EDITAR
            </button>
            <button type="button" className="btn-accion" onClick={handleEliminar}>
              ELIMINAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GestionPrendas;