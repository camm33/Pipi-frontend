import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listaDeseos, setListaDeseos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroIntercambio, setFiltroIntercambio] = useState("");
  const [filtroTalla, setFiltroTalla] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("");

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const idUsuario = localStorage.getItem("id_usuario");

  // 🔹 Cargar publicaciones y lista de deseos del usuario actual
  useEffect(() => {
    fetch("http://localhost:5000/api/publicaciones")
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => {
        // El backend puede devolver { ok: true, publicaciones: [...] } o directamente un array
        const items = Array.isArray(data) ? data : data.publicaciones || [];

        console.debug("/api/publicaciones ->", items);

        // El backend ya filtra por estado (cuando aplica). Aquí usamos los items tal cual
        items.sort((a, b) => {
          if (a.fecha_publicacion && b.fecha_publicacion) {
            return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
          }
          return 0;
        });

        setProductos(items);
      })
      .catch((err) => {
        console.error("❌ Error al cargar productos:", err);
        setError("No se pudieron cargar las publicaciones");
      })
      .finally(() => setLoading(false));

    if (idUsuario) {
      const listaGuardada =
        JSON.parse(localStorage.getItem(`lista_deseos_${idUsuario}`)) || [];
      setListaDeseos(listaGuardada);
    }
  }, [idUsuario]);

  // 🔹 Ver detalle
  const handleVerMas = (id) => {
    if (!isLoggedIn) {
      navigate("/iniciar");
    } else {
      navigate(`/detalle_prenda/${id}`);
    }
  };

  // 🔹 Agregar/Quitar de la lista de deseos
  const toggleDeseo = (prod) => {
    if (!idUsuario) return;

    const yaEsta = listaDeseos.find(
      (item) => item.id_publicacion === prod.id_publicacion
    );
    let nuevaLista;

    if (yaEsta) {
      nuevaLista = listaDeseos.filter(
        (item) => item.id_publicacion !== prod.id_publicacion
      );
    } else {
      nuevaLista = [...listaDeseos, prod];
    }

    setListaDeseos(nuevaLista);
    localStorage.setItem(`lista_deseos_${idUsuario}`, JSON.stringify(nuevaLista));
  };

  // 🔹 Verificar si está en deseos
  const estaEnDeseos = (id) => {
    return listaDeseos.some((item) => item.id_publicacion === id);
  };

  // 🔍 Filtrar productos según búsqueda y filtros
  const filtrarProductos = () => {
    return productos.filter((prod) => {
      const nombreField = (prod.nombre_prenda || prod.nombre || "").toString();
      const coincideNombre = nombreField.toLowerCase().includes(busqueda.toLowerCase());

      const coincideIntercambio = filtroIntercambio
        ? prod.tipo_publicacion?.toLowerCase() === filtroIntercambio.toLowerCase()
        : true;

      const coincideTalla = filtroTalla
        ? prod.talla?.toLowerCase() === filtroTalla.toLowerCase()
        : true;

  const precio = Number(prod.valor) || 0;
      const coincidePrecio =
        filtroPrecio === "menor_50"
          ? precio <= 50000
          : filtroPrecio === "mayor_10"
          ? precio >= 10000
          : filtroPrecio === "rango"
          ? precio >= 10000 && precio <= 50000
          : true;

      return coincideNombre && coincideIntercambio && coincideTalla && coincidePrecio;
    });
  };

  return (
    <div className="home-container">
      <div className="home-texto">
        <p>Moda Sostenible</p>
        <h1>“Sin límites, sin barreras: más tallas, más opciones, más de ti.”</h1>
      </div>

      {/* 🔎 Filtros */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <select
          value={filtroIntercambio}
          onChange={(e) => setFiltroIntercambio(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">Todos los tipos</option>
          <option value="intercambio">Solo intercambio</option>
          <option value="venta">Solo venta</option>
        </select>

        <select
          value={filtroTalla}
          onChange={(e) => setFiltroTalla(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="">Todas las tallas</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>

        <select
          value={filtroPrecio}
          onChange={(e) => setFiltroPrecio(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="">Todos los precios</option>
          <option value="menor_50">Menor a $50.000</option>
          <option value="mayor_10">Mayor a $10.000</option>
          <option value="rango">Entre $10.000 y $50.000</option>
        </select>
      </div>

      <div className="catalogo-container">
        {loading && <p>Cargando publicaciones...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && filtrarProductos().length === 0 && (
          <p>No hay publicaciones que coincidan.</p>
        )}

        <div className="catalogo-grid">
          {filtrarProductos().map((prod) => (
            <div key={prod.id_publicacion} className="producto-card">
              <img
                src={prod.foto_url ? prod.foto_url : `http://localhost:5000/uploads/${prod.foto}`}
                alt={prod.nombre_prenda}
                className="producto-img"
              />
              <h4>{prod.nombre_prenda}</h4>
              <p>${prod.valor ? prod.valor : "0"}</p>
              <div className="botones-flex">
                <button
                  className="lista-deseos-vermas"
                  onClick={() => handleVerMas(prod.id_publicacion)}
                >
                  Ver más
                </button>
                {isLoggedIn && (
                  <button
                    className="lista-deseos-corazon"
                    onClick={() => toggleDeseo(prod)}
                    title={
                      estaEnDeseos(prod.id_publicacion)
                        ? "Quitar de la lista de deseos"
                        : "Agregar a lista de deseos"
                    }
                  >
                    {estaEnDeseos(prod.id_publicacion) ? "\u2665" : "\u2661"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
