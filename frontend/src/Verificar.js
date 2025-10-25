// Verificar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./register.css"; // Puedes usar el mismo estilo del register

function Verificar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || ""; // Obtener email desde URL
  const [token, setToken] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje("");

    try {
      const response = await fetch("http://localhost:5000/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMensaje("✅ " + result.mensaje);

        setTimeout(() => {
          navigate("/iniciar"); // Redirigir al login tras verificar
        }, 1500);
      } else {
        setMensaje("⚠ " + (result.mensaje || "Ocurrió un error en la verificación."));
      }
    } catch (error) {
      console.error("❌ Error en verificar:", error);
      setMensaje("❌ Error en el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-main">
        <h2>Verifica tu cuenta</h2>
        <p>Se envió un token al correo <strong>{email}</strong>. Ingresa el token para continuar.</p>

        {mensaje && (
          <p
            style={{
              textAlign: "center",
              color: mensaje.includes("✅") ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {mensaje}
          </p>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token">* Token de verificación</label>
            <input
              type="text"
              id="token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <p>
          ¿No recibiste el token?{" "}
          <Link to="/iniciar" className="login-link">
            Regresar al login
          </Link>
        </p>
      </main>
    </div>
  );
}

export default Verificar;
