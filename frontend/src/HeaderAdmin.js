import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Header.css";

const HeaderAdmin = ({ setIsLoggedIn }) => {
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
        <Link to="/AdminDashboard">
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

        <span className="username">{username || "Administrador"}</span>
      </div>

      <div className="icons">
        <button className="icon-btn" title="Cerrar Sesión" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;
