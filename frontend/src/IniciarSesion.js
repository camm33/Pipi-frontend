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
    "/Daniela.jpg",
    "/prenda2.jpg",
    "/prenda3.jpg",
    "/prenda4.jpg",
    "/prenda5.jpg",
    "/prenda6.jpg",
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // autoplay
  useEffect(() => {
    if (paused) return; // no avanzar cuando está en pausa
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % carouselImages.length);
    }, 2000);
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

          {/* Botones de inicio de sesión social */}
          {!mostrarToken && (
            <div className="social-login-buttons">
              <button type="button" className="social-btn google-btn">
                <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Iniciar sesión con Google
              </button>
              
              <button type="button" className="social-btn apple-btn">
                <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Iniciar sesión con iPhone
              </button>
            </div>
          )}
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
