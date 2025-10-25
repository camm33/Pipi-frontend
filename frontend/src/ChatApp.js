// ChatApp.jsx
import React, { useEffect, useState } from "react";

function ChatApp({ loggedUserId, profileUserId }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // Cargar mensajes entre loggedUserId y profileUserId
  useEffect(() => {
    fetch(
      `http://localhost:5000/chat/mensajes?id_remitente=${loggedUserId}&id_destinatario=${profileUserId}`
    )
      .then((res) => res.json())
      .then((data) => setMensajes(data));
  }, [loggedUserId, profileUserId]);

  // Enviar un mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const res = await fetch("http://localhost:5000/chat/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_remitente: loggedUserId,
        id_destinatario: profileUserId,
        mensaje: nuevoMensaje,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMensajes(data.mensajes);
      setNuevoMensaje("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>💬 Chat</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {mensajes.map((m, i) => (
          <p key={i}>
            <strong>{m.remitente}:</strong> {m.mensaje} <br />
            <small>{m.fecha}</small>
          </p>
        ))}
      </div>

      <input
        type="text"
        value={nuevoMensaje}
        onChange={(e) => setNuevoMensaje(e.target.value)}
        placeholder="Escribe un mensaje..."
        style={{ width: "80%" }}
      />
      <button onClick={enviarMensaje}>Enviar</button>
    </div>
  );
}

export default ChatApp;
