import { useState, useEffect } from "react";

function EnviarCorreo() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [emails, setEmails] = useState([]);
  const [modo, setModo] = useState("uno"); // 'uno' o 'todos'

  const handleEnviar = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/enviar_correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: modo === 'todos' ? null : correo, mensaje, enviar_todos: modo === 'todos' })
      });
      const data = await res.json();
      setRespuesta(data.resultado || JSON.stringify(data));
    } catch (error) {
      setRespuesta("Error al enviar correo");
    }
  };

  useEffect(() => {
    // Cargar lista de correos disponibles para seleccionar
    const fetchEmails = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/usuarios_emails");
        const data = await res.json();
        if (data && data.emails) setEmails(data.emails);
      } catch (err) {
        console.error('No se pudieron cargar los emails', err);
      }
    };
    fetchEmails();
  }, []);

  return (
    <div style={{ border: '1px solid #2b6cb0', padding: '16px', borderRadius: '8px', background: '#f0f7ff' }}>
      <h2 style={{ color: '#2b6cb0' }}>Enviar correo (Admin)</h2>

      <div style={{ marginBottom: 8 }}>
        <label style={{ marginRight: 12 }}>
          <input type="radio" name="modo" value="uno" checked={modo === 'uno'} onChange={() => setModo('uno')} /> Enviar a un correo
        </label>
        <label>
          <input type="radio" name="modo" value="todos" checked={modo === 'todos'} onChange={() => setModo('todos')} /> Enviar a todos
        </label>
      </div>

      {modo === 'uno' && (
        <div style={{ marginBottom: 8 }}>
          <select value={correo} onChange={(e) => setCorreo(e.target.value)} style={{ padding: 8, minWidth: 300 }}>
            <option value="">-- Selecciona un correo --</option>
            {emails.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <div style={{ marginTop: 6 }}>
            <input type="email" placeholder="O escribe un correo" value={correo} onChange={(e) => setCorreo(e.target.value)} style={{ padding: 8, minWidth: 300 }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <textarea placeholder="Mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} style={{ width: '100%', minHeight: 120, padding: 8 }} />
      </div>

      <div>
        <button onClick={handleEnviar} style={{ background: '#2b6cb0', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6 }}>Enviar</button>
      </div>

      {respuesta && (
        <p style={{ marginTop: 12, color: '#1a365d' }}>{respuesta}</p>
      )}
    </div>
  );
}

export default EnviarCorreo;
