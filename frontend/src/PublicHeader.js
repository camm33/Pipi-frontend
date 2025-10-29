import React from "react";
import { Link } from "react-router-dom";
import "./PublicHeader.css";

const PublicHeader = () => {
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

      {/* Navegación central */}
      <nav className="nav-links">
        <Link to="/" className="nav-link">Menú</Link>
        <a href="#about" className="nav-link">Acerca de</a>
        <a href="#contact" className="nav-link">Contacto</a>
        <a href="#projects" className="nav-link">Proyectos</a>
      </nav>

      {/* Botón iniciar sesión */}
      <div className="auth-section">
        <Link to="/iniciar">
          <button className="login-btn">Iniciar sesión</button>
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;


