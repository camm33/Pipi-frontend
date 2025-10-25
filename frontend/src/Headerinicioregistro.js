import React from "react";
import { Link } from "react-router-dom";

const Headerinicioregistro = () => {
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
        <Link to="/Home">
          <button className="icon-btn">Volver</button>
        </Link>
      </div>
    </header>
  );
};

export default Headerinicioregistro;
