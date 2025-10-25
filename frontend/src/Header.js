/*import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

const Header = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [foto, setFoto] = useState("");

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("username");
    const fotoGuardada = localStorage.getItem("foto_usuario");

    if (nombreGuardado) setUsername(nombreGuardado);
    if (fotoGuardada) setFoto(fotoGuardada);
  }, []);

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
      <div className="logo">
        <Link to="/MiPerfil">
          {foto ? (
            <img
              src={`http://localhost:5000/uploads/${foto}`}
              alt="Perfil"
              className="profile-pic"
            />
          ) : (
            <span className="profile-placeholder">👤</span>
          )}
        </Link>

        <span className="username">{username || "Usuario"}</span>
      </div>

      <div className="icons">
        <Link to="/agregar">
          <button className="icon-btn" title="Agregar prenda">
            ➕ 
          </button>
        </Link>

        <Link to="/lista_deseos">
          <button className="icon-btn" title="Lista de Deseos">
            🪄
          </button>
        </Link>

        <button className="icon-btn" title="Configuración">
          ⚙️
        </button>

        <button className="icon-btn" title="Cerrar Sesión" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;*/

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

const Header = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [foto, setFoto] = useState("");

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("username");
    const fotoGuardada = localStorage.getItem("foto_usuario");

    if (nombreGuardado) setUsername(nombreGuardado);
    if (fotoGuardada) setFoto(fotoGuardada);
  }, []);

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
      <div className="logo">
        <Link to="/MiPerfil">
          {foto ? (
            <img
            src={`http://localhost:5000/uploads/${foto}`}
            alt="Perfil"
            className="profile-pic"
          />

          ) : (
            <span className="profile-placeholder">👤</span>
          )}
        </Link>

        <span className="username">{username || "Usuario"}</span>
      </div>

      <div className="icons">
        <Link to="/agregar">
          <button className="icon-btn" title="Agregar prenda">
            ➕
          </button>
        </Link>

        <Link to="/lista_deseos">
          <button className="icon-btn" title="Lista de Deseos">
            🪄
          </button>
        </Link>

        <Link to="/configuracion">
          <button className="icon-btn" title="Configuración">
            ⚙️
          </button>
        </Link>

        <button className="icon-btn" title="Cerrar Sesión" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
