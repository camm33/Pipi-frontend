import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [foto, setFoto] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Array con las rutas de navegación
  const navItems = [
    { path: "/catalogo", label: "Menú" },
    { path: "/agregar", label: "Publicar" },
    { path: "/lista_deseos", label: "Deseos" },
    { path: "/configuracion", label: "Configuración" }
  ];

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("username");
    const fotoGuardada = localStorage.getItem("foto_usuario");

    if (nombreGuardado) setUsername(nombreGuardado);
    if (fotoGuardada) setFoto(fotoGuardada);
  }, []);

  // Detectar página activa y actualizar índice de la barra
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => 
      location.pathname === item.path || 
      (location.pathname === "/" && item.path === "/catalogo") ||
      (location.pathname.includes("/detalle_prenda") && item.path === "/catalogo")
    );
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_usuario");
    localStorage.removeItem("username");
    localStorage.removeItem("foto_usuario");

    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="header-container">
      {/* Logo */}
      <div className="logo">
        <img
          src="/LOGO.png"
          alt="Double P Logo"
          className="logo-img"
        />
        <span className="site-name">Double_P</span>
      </div>

      {/* Navegación central con barra deslizante */}
      <nav className="nav-links">
        {navItems.map((item, index) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-link ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {item.label}
          </Link>
        ))}
        {/* Barra deslizante */}
        <div 
          className={`sliding-bar ${navItems[activeIndex].label.toLowerCase().replace('ó', 'o')}`}
          style={{
            transform: `translateX(${activeIndex * 100 - 18}%)`
          }}
        />
      </nav>

      {/* Usuario */}
      <div className="user-section">
        <span className="username">{username}</span>
        <Link to="/MiPerfil" className="profile-link">
          {foto ? (
            <img
              src={`http://localhost:5000/uploads/${foto}`}
              alt="Perfil"
              className="profile-pic"
            />
          ) : (
            <img
              src="/LOGO.png"
              alt="Default Profile"
              className="profile-pic default-profile"
            />
          )}
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;