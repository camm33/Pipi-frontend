import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_usuarios: null,
    publicaciones_activas: null,
    numero_usuarios: null,
    numero_administradores: null,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const urls = [
          "http://localhost:5000/api/admin/total_usuarios",
          "http://localhost:5000/api/admin/publicaciones_activas",
          "http://localhost:5000/api/admin/numero_usuarios",
          "http://localhost:5000/api/admin/numero_administradores",
        ];
        const [total, activas, usuarios, admins] = await Promise.all(
          urls.map((url) =>
            fetch(url, { credentials: "include" }).then((r) => r.json())
          )
        );
        setStats({
          total_usuarios: total.total_usuarios,
          publicaciones_activas: activas.publicaciones_activas,
          numero_usuarios: usuarios.numero_usuarios,
          numero_administradores: admins.numero_administradores,
        });
      } catch (e) {
        setStats({
          total_usuarios: "error",
          publicaciones_activas: "error",
          numero_usuarios: "error",
          numero_administradores: "error",
        });
      }
      setLoading(false);
    };

    const fetchGrafico = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/publicaciones_tipo",
          { credentials: "include" }
        );
        const result = await res.json();

        if (result && Array.isArray(result.data)) {
          const labels = result.data.map((item) => item.tipo);
          const valores = result.data.map((item) => item.total);

          const colores = [
            "#4CAF50", "#2196F3", "#FF9800", "#d037ebff",
            "#FF5722", "#3F51B5", "#00BCD4", "#CDDC39",
            "#E91E63", "#795548"
          ];

          const chartObj = {
            labels,
            datasets: [
              {
                label: "Cantidad de publicaciones",
                data: valores,
                backgroundColor: colores.slice(0, valores.length),
              },
            ],
          };

          setChartData(chartObj);
        }
      } catch (err) {
        console.error("Error cargando gráfico:", err);
      }
    };

    fetchStats();
    fetchGrafico();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="menu">
          <div className="menu-item">
            Usuario
            <div className="menu-sub">
              <div className="sub-item">Editar</div>
              <div className="sub-item">Eliminar</div>
              <div className="sub-item">
                <button onClick={() => window.location.href = '/AdminDashboard/mensaje'} style={{ background: 'transparent', border: 'none', color: '#2b6cb0', cursor: 'pointer' }}>Enviar mensaje</button>
              </div>
            </div>
          </div>

          <div className="menu-item">
            Prendas
            <div className="menu-sub">
              <div className="sub-item">Editar</div>
              <div className="sub-item">Eliminar</div>
              <div className="sub-item">Ver</div>
            </div>
          </div>

          <div className="menu-item">
            Publicaciones
            <div className="menu-sub">
              <div className="sub-item">Editar</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-box">
            TOTAL DE USUARIOS
            <br />
            {stats.total_usuarios}
          </div>
          <div className="stat-box">
            TOTAL DE PRENDAS ACTIVAS
            <br />
            {stats.publicaciones_activas}
          </div>
          <div className="stat-box">
            N° usuarios
            <br />
            {stats.numero_usuarios}
          </div>
          <div className="stat-box">
            N° administradores
            <br />
            {stats.numero_administradores}
          </div>
          <div className="stat-box">
            <Link to="/AdminDashboard/mensaje" className="report-btn" style={{ textDecoration: 'none' }}>Enviar mensaje</Link>
          </div>
        </div>

        <div className="chart-report-container">
          <div className="chart-section">
            <h3>Gráfica de: Intercambio vs venta</h3>
            <div className="chart-wrapper">
              {chartData ? <Bar data={chartData} /> : <p>Cargando gráfica...</p>}
            </div>
          </div>
                    <div className="report-section">
  <h3 className="report-title">Reportes en PDF</h3>
  <div className="report-list">
    <button
      className="report-btn"
      onClick={() => window.open('http://localhost:5000/api/reportes/usuarios_tallas', '_blank')}
    >
      Usuarios según su talla
    </button>
    <button
      className="report-btn"
      onClick={() => window.open('http://localhost:5000/api/reportes/publicaciones_tallas', '_blank')}
    >
      Prendas publicadas por talla 
    </button>
    <button
      className="report-btn"
      onClick={() => window.open('http://localhost:5000/api/reportes/peores_valoraciones', '_blank')}
    >
      Peores valoraciones 
    </button>
    <button
      className="report-btn"
      onClick={() => window.open('http://localhost:5000/api/reportes/caro_vs_economico', '_blank')}
    >
      Prendas más caras vs económicas 
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

