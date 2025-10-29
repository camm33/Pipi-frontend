import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PublicHeader from './PublicHeader';
import modeloBanner from './modelobanner.jpg';
import modeloBanner2 from './modelobanner2.jpg';
import './Home.css';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listaDeseos, setListaDeseos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroIntercambio, setFiltroIntercambio] = useState("");
  const [filtroTalla, setFiltroTalla] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("");
  
  // Estados para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedSlide, setDisplayedSlide] = useState(0); // Para mantener la imagen actual durante transición
  const [nextSlideIndex, setNextSlideIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [isTextTransitioning, setIsTextTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right'); // 'left' o 'right'

  // Datos del carrusel
  const carouselData = [
    {
      image: modeloBanner,
      title: "DOUBLE P",
      subtitle: "Moda Sostenible",
      description: "Descubre una nueva forma de vestir con estilo y responsabilidad. Nuestra colección exclusiva te ofrece las últimas tendencias en moda sostenible."
    },
    {
      image: modeloBanner2,
      title: "DOUBLE P",
      subtitle: "Estilo sin Límites",
      description: "Más tallas, más opciones, más de ti. Celebramos la diversidad y la autenticidad con prendas diseñadas para cada cuerpo y personalidad única."
    }
  ];

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

  // 🎠 Funciones del carrusel
  const nextSlide = () => {
    if (isImageTransitioning || isTextTransitioning) return;
    
    const newSlideIndex = (currentSlide + 1) % carouselData.length;
    setSlideDirection('right');
    setNextSlideIndex(newSlideIndex);
    
    // Animación del texto (rápida)
    setIsTextTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(newSlideIndex);
      setTimeout(() => {
        setIsTextTransitioning(false);
      }, 200);
    }, 150);
    
    // Animación de la imagen (lenta)
    setIsImageTransitioning(true);
    setTimeout(() => {
      setDisplayedSlide(newSlideIndex); // Actualizar la imagen mostrada al final
      setIsImageTransitioning(false);
    }, 1500);
  };

  const prevSlide = () => {
    if (isImageTransitioning || isTextTransitioning) return;
    
    const newSlideIndex = (currentSlide - 1 + carouselData.length) % carouselData.length;
    setSlideDirection('left');
    setNextSlideIndex(newSlideIndex);
    
    // Animación del texto (rápida)
    setIsTextTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(newSlideIndex);
      setTimeout(() => {
        setIsTextTransitioning(false);
      }, 200);
    }, 150);
    
    // Animación de la imagen (lenta)
    setIsImageTransitioning(true);
    setTimeout(() => {
      setDisplayedSlide(newSlideIndex); // Actualizar la imagen mostrada al final
      setIsImageTransitioning(false);
    }, 1500);
  };

  const productosFiltrados = filtrarProductos();

  return (
    <div className="home-container">
      {/* Hero Section con Carrusel */}
      <div className="hero-section">
        {/* Flechas de navegación */}
        <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Imagen actual */}
        <div 
          className={`hero-background current-slide ${isImageTransitioning ? 'fade-out' : ''}`}
          style={{
            backgroundImage: `url(${carouselData[displayedSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        ></div>
        
        {/* Imagen siguiente (aparece durante la transición) */}
        {isImageTransitioning && (
          <div 
            className="hero-background next-slide fade-in"
            style={{
              backgroundImage: `url(${carouselData[nextSlideIndex].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2
            }}
          ></div>
        )}
        
        <div className="hero-overlay" style={{ zIndex: 3 }}></div>
        <div className="hero-content" style={{ zIndex: 4 }}>
          <div className="hero-text">
            {/* Título fijo - no se anima */}
            <h1 className="hero-title hero-title-fixed">DOUBLE P</h1>
            
            {/* Contenido que sí se anima */}
            <div className={`hero-dynamic-content ${isTextTransitioning ? 'text-transitioning' : ''}`}>
              <h2 className="hero-subtitle">{carouselData[currentSlide].subtitle}</h2>
              <p className="hero-description">
                {carouselData[currentSlide].description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Redes Sociales */}
        <div className="social-media-icons" style={{ zIndex: 5 }}>
          <a href="https://m.facebook.com/DDOUBLEPP/" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          
          <a href="https://www.instagram.com/ddouble__pi?igsh=YTY1bDAzaDAzMjhx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
          <a href="https://pin.it/5yW7QgyGE" target="_blank" rel="noopener noreferrer" className="social-icon pinterest">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.482-1.995.699 0 1.037.219 1.037 1.037 0 .631-.399 1.574-.606 2.449-.219.937.469 1.701 1.381 1.701 1.658 0 2.939-1.754 2.939-4.287 0-2.24-1.611-3.804-3.917-3.804-2.668 0-4.235 2.003-4.235 4.075 0 .807.307 1.672.691 2.141.076.09.087.171.065.263-.07.295-.23.943-.262 1.077-.041.177-.134.215-.31.129-1.216-.567-1.976-2.345-1.976-3.777 0-3.083 2.241-5.925 6.462-5.925 3.395 0 6.033 2.423 6.033 5.653 0 3.375-2.127 6.089-5.081 6.089-.992 0-1.926-.52-2.245-1.139l-.613 2.335c-.222.857-.822 1.925-1.222 2.577.921.285 1.91.441 2.931.441 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017 0z"/>
            </svg>
          </a>
          
          <a href="https://x.com/DDOUBLE_PPP" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Texto original (ahora más pequeño) */}
      <div className="home-texto">
        <p>Moda Sostenible</p>
        <h1>"Sin límites, sin barreras: más tallas, más opciones, más de ti."</h1>
      </div>

      {/* 🔎 Filtros */}
      <div className="filtros-wrapper">
        <div className="filtros-titulo">
          <h3>🔍 Encuentra tu prenda perfecta</h3>
          <p>Utiliza los filtros para personalizar tu búsqueda</p>
        </div>
        
        <div className="filtros-container">
          <div className="filtro-item">
            <label>Buscar por nombre</label>
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtro-item">
            <label>Tipo de publicación</label>
            <select
              value={filtroIntercambio}
              onChange={(e) => setFiltroIntercambio(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="intercambio">Solo intercambio</option>
              <option value="venta">Solo venta</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Talla</label>
            <select
              value={filtroTalla}
              onChange={(e) => setFiltroTalla(e.target.value)}
            >
              <option value="">Todas las tallas</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Rango de precio</label>
            <select
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
            >
              <option value="">Todos los precios</option>
              <option value="menor_50">Menor a $50.000</option>
              <option value="mayor_10">Mayor a $10.000</option>
              <option value="rango">Entre $10.000 y $50.000</option>
            </select>
          </div>
        </div>
      </div>

      <div className="catalogo-container">
        <h2 className="catalogo-titulo">Productos destacados</h2>
        
        {/* Contador de resultados */}
        {!loading && !error && (
          <div className="resultados-info">
            <p>
              Se encontraron <span className="numero">{filtrarProductos().length}</span> 
              {filtrarProductos().length === 1 ? ' producto' : ' productos'} 
              {(busqueda || filtroIntercambio || filtroTalla || filtroPrecio) && ' con los filtros aplicados'}
            </p>
          </div>
        )}
        
        {loading && <p>Cargando publicaciones...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && filtrarProductos().length === 0 && (
          <div className="resultados-info">
            <p>😔 No hay publicaciones que coincidan con los filtros.</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>Intenta ajustar los criterios de búsqueda.</p>
          </div>
        )}

        <div className="catalogo-grid">
          {filtrarProductos().map((prod) => (
            <div key={prod.id_publicacion} className="producto-card">
              {/* Badge/Etiqueta si es intercambio */}
              {prod.tipo_publicacion?.toLowerCase() === 'intercambio' && (
                <div className="producto-badge">INTERCAMBIO</div>
              )}
              
              <img
                src={prod.foto_url || `http://localhost:5000/uploads/${prod.foto}`}
                alt={prod.nombre_prenda}
                onError={(e) => {
                  e.target.src = `http://localhost:5000/uploads/${prod.foto}`;
                }}
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
