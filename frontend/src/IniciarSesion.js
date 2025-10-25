import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IniciarSesion.css";

function IniciarSesion({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [bloqueoRestante, setBloqueoRestante] = useState(null);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [token, setToken] = useState("");
  const bloqueoTimer = useRef(null);
  const navigate = useNavigate();

  // Carrusel de imágenes (panel derecho)
  const carouselImages = [
    "/rocket-login.jpg",
    "/Daniela.jpg",
    "/petrouribista.jpg",
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // autoplay
  useEffect(() => {
    if (paused) return; // no avanzar cuando está en pausa
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(id);
  }, [paused, carouselImages.length]);
  const goTo = (idx) => setSlideIndex(((idx % carouselImages.length) + carouselImages.length) % carouselImages.length);
  const next = () => goTo(slideIndex + 1);
  const prev = () => goTo(slideIndex - 1);

  // Contador regresivo bloqueo
  useEffect(() => {
    if (bloqueoRestante === null) return;
    if (bloqueoRestante <= 0) {
      setBloqueoRestante(null);
      setMensaje("");
      return;
    }
    bloqueoTimer.current = setTimeout(() => {
      setBloqueoRestante((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(bloqueoTimer.current);
  }, [bloqueoRestante]);

  // -------- LOGIN --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
  const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ usuario: username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMostrarToken(true);
        setMensaje("📧 Te hemos enviado un token a tu correo");
      } else {
        setMensaje(result.mensaje || "⚠ Error al iniciar sesión");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje("⚠ Error en la conexión");
    }
  };

  // -------- VERIFICAR TOKEN --------
  const handleVerificarToken = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
  const response = await fetch("http://localhost:5000/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo: username, token }),

      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Guardar datos mínimos
        localStorage.setItem("id_usuario", result.id_usuario || "");
        localStorage.setItem("username", username);
        localStorage.setItem("token", "token_simulado");
        if (result.id_rol) {
          localStorage.setItem("id_rol", String(result.id_rol));
        }

        setIsLoggedIn(true);
        setMensaje("✅ Inicio de sesión exitoso");

        setTimeout(() => {
          navigate("/Catalogo");
        }, 500);
      } else {
        setMensaje(result.mensaje || "⚠ Token inválido o expirado");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje("⚠ Error en la conexión");
    }
  };

  return (
    <div className="login-seedprod-root">
      <div className="login-seedprod-left">
        <div className="login-seedprod-logo">
          <img src="/LOGO.png" alt="Logo" />
          <h1 className="seedprod-title">Double Π</h1>
          <h2 className="seedprod-login">Iniciar sesión</h2>
          <p className="seedprod-register">
            ¿No tienes una cuenta? <a href="/register">Regístrate ahora</a>
          </p>
        </div>
        <form className="seedprod-form" onSubmit={mostrarToken ? handleVerificarToken : handleSubmit}>
          <label className="seedprod-label" htmlFor="username">Correo electrónico</label>
          {!mostrarToken && (
            <input
              className="seedprod-input"
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Introduce tu correo"
              title="Introduce tu correo"
            />
          )}
          {mostrarToken && (
            <input
              className="seedprod-input"
              type="text"
              id="token"
              name="token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="one-time-code"
            />
          )}
          {!mostrarToken && (
            <>
              <label className="seedprod-label" htmlFor="password">Contraseña</label>
              <input
                className="seedprod-input"
                type="password"
                id="password"
                name="password"
                required
                minLength={3}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Agrega tu contraseña"
                title="Agrega tu contraseña"
              />
            </>
          )}
          <div className="seedprod-remember-forgot">
            <label className="seedprod-remember">
              <input type="checkbox" /> Recuérdame
            </label>
            <a className="seedprod-forgot" href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
          </div>
          {mensaje && (
            <div className="seedprod-message">
              {mensaje}
              {bloqueoRestante !== null && bloqueoRestante > 0 && (
                <span style={{ display: "block", marginTop: 8 }}>
                  ⏳ Espera {Math.floor(bloqueoRestante / 60)}:
                  {String(bloqueoRestante % 60).padStart(2, "0")} para volver a intentar.
                </span>
              )}
            </div>
          )}
          <button
            type="submit"
            className="seedprod-login-btn"
            disabled={bloqueoRestante !== null && bloqueoRestante > 0}
          >
            {mostrarToken ? "Verificar Token" : "Iniciar sesión"}
          </button>
        </form>
      </div>
      <div className="login-seedprod-right">
        <div
          className="login-carousel"
          aria-label="Carrusel de imágenes"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {carouselImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Imagen ${i + 1} del carrusel`}
              className={`carousel-image ${i === slideIndex ? "active" : ""}`}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}

          {/* Zonas de borde con difuminado para navegar */}
          <div className="carousel-edge left" role="button" aria-label="Anterior" onClick={prev} />
          <div className="carousel-edge right" role="button" aria-label="Siguiente" onClick={next} />

          <div className="carousel-dots" role="tablist" aria-label="Indicadores del carrusel">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={`Ir a la imagen ${i + 1}`}
                className={`carousel-dot ${i === slideIndex ? "active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IniciarSesion;
