import React from "react";
import { Link } from "react-router-dom";
import "./PublicHeader.css";

const PublicHeader = () => {
  return (
    <header className="header-container">
      {/* Logo y nombre de la empresa */}
      <div className="logo">
        <img
          src="/LOGO.png" // logo
          alt="Double P Logo"
          className="logo-img"
        />
        <span className="site-name">Double_P</span>
      </div>

      {/* Botones de navegación */}
      <div className="icons">
        <Link to="/iniciar">
          <button className="icon-btn">Iniciar sesión</button>
        </Link>
        <Link to="/register">
          <button className="icon-btn">Registrarse</button>
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;


