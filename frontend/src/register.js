import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    username: "",
    email: "",
    contrasena: "",
    talla: "",
    fecha_nacimiento: "",
    foto: null,
  });

  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [popEffect, setPopEffect] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Si es la foto de perfil, crear preview y activar efectos
      if (name === "foto" && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
          // Activar efecto pop
          setPopEffect(true);
          // Mostrar confetti
          setShowConfetti(true);
          
          // Quitar el efecto pop después de la animación
          setTimeout(() => setPopEffect(false), 600);
          // Quitar el confetti después de la animación
          setTimeout(() => setShowConfetti(false), 2000);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje("");

    try {
      // Enviar FormData para incluir la foto
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          dataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        body: dataToSend,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMensaje("✅ " + result.mensaje);

        // Redirigir a verificar
        setTimeout(() => {
          navigate(`/verificar?email=${formData.email}`);
        }, 1500);

        // Limpiar formulario
        setFormData({
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          username: "",
          email: "",
          contrasena: "",
          talla: "",
          fecha_nacimiento: "",
          foto: null,
        });
      } else {
        setMensaje("⚠ " + (result.mensaje || "Ocurrió un error en el registro."));
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje("❌ Error en el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {/* Panel izquierdo con imagen y texto */}
      <div className="register-left-panel">
        <div className="gold-bar"></div>
        <div className="left-content">
          <h1 className="welcome-text">
            Eslogan
          </h1>
          <div className={`profile-circle ${popEffect ? 'pop-effect' : ''}`}>
            <img 
              src={previewImage || "/LOGO.png"} 
              alt="Profile" 
              className="profile-image" 
            />
            {showConfetti && (
              <div className="confetti-container">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`confetti confetti-${i % 5}`}></div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="decorative-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="register-right-panel">
        <div className="register-header">
          <h2 className="logo-text">Double Π</h2>
          <p className="signin-link">
            ¿Ya te has registrado?{" "}
            <Link to="/iniciar" className="login-link">
              Iniciar Sesión
            </Link>
          </p>
        </div>

        <main className="register-main">
          <h2>Crea una cuenta nueva</h2>

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

          <div className="register-form-container">
            <form className="register-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="primer_nombre">* Primer nombre</label>
            <input
              type="text"
              id="primer_nombre"
              name="primer_nombre"
              value={formData.primer_nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="segundo_nombre">Segundo nombre</label>
            <input
              type="text"
              id="segundo_nombre"
              name="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="primer_apellido">* Primer apellido</label>
            <input
              type="text"
              id="primer_apellido"
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="segundo_apellido">Segundo apellido</label>
            <input
              type="text"
              id="segundo_apellido"
              name="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="username">* Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">* Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="contrasena">* Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="talla">* Talla</label>
            <select
              id="talla"
              name="talla"
              value={formData.talla}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu talla</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="Petite">Petite</option>
              <option value="Plus Size">Plus Size</option>
            </select>
          </div>

          <div>
            <label htmlFor="fecha_nacimiento">* Fecha de nacimiento</label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="foto">* Foto de perfil</label>
            <input
              type="file"
              id="foto"
              name="foto"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        </div>

        <div className="copyright">
          Copyright © Doble P
        </div>
        </main>
      </div>
    </div>
  );
}

export default Register;
