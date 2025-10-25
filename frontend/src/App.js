import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Home";
import Iniciar from "./IniciarSesion";
import Agregar from "./AgregarPublicacion";
import Editar from "./editar_perfil";
import Register from "./register";
import MiPerfil from "./MiPerfil";
import DetallePrenda from "./DetallePrenda";
import AdminDashboard from "./AdminDashboard";
import ListaDeDeseos from "./ListaDeDeseos";
import AppPerfiles from "./perfiles";
import GestionarPrenda from "./GestionPublicaciones";
import Configuracion from "./Configuracion";
import Verificar from "./Verificar";
import MensajeAdmin from "./MensajeAdmin";

import Header from "./Header";
import HeaderAdmin from "./HeaderAdmin";
import Footer from "./Footer";
import PublicHeader from "./PublicHeader";
import Headerinicioregistro from "./Headerinicioregistro";

// Rutas privadas
function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/iniciar" />;
}

// Rutas públicas
function PublicRoute({ isLoggedIn, children, redirectTo = "/" }) {
  return !isLoggedIn ? children : <Navigate to={redirectTo} />;
}

// Rutas para Admin
function AdminRoute({ isLoggedIn, children }) {
  const idRol = localStorage.getItem("id_rol");
  return isLoggedIn && (idRol === "1" || idRol === 1)
    ? children
    : <Navigate to="/iniciar" />;
}

// 🔹 Nueva ruta para usuarios normales (evita que admin acceda a catálogo)
function UserRoute({ isLoggedIn, children }) {
  const idRol = localStorage.getItem("id_rol");
  return isLoggedIn && (idRol === "2" || idRol === 2) // asumo que el rol 2 = usuario normal
    ? children
    : <Navigate to="/" />;
}

// Layout
function Layout({ header, children }) {
  return (
    <>
      {header}
      {children}
      <Footer />
    </>
  );
}

// App
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <div className="App">
        <main>
          <Routes>

            <Route
              path="/"
              element={
                isLoggedIn ? (
                  localStorage.getItem("id_rol") === "1" ? (
                    <Navigate to="/AdminDashboard" />
                  ) : (
                    <Navigate to="/catalogo" />
                  )
                ) : (
                  <Layout header={<PublicHeader />}>
                    <Home />
                  </Layout>
                )
              }
            />

            {/* Catálogo → solo usuarios normales */}
            <Route
              path="/catalogo"
              element={
                <UserRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Home />
                  </Layout>
                </UserRoute>
              }
            />

            {/* Registro */}
            <Route
              path="/register"
              element={
                <PublicRoute isLoggedIn={isLoggedIn}>
                  <>
                    <Headerinicioregistro />
                    <Register setIsLoggedIn={setIsLoggedIn} />
                  </>
                </PublicRoute>
              }
            />
             {/* Verificar */}
<Route
  path="/verificar"
  element={
    <PublicRoute isLoggedIn={isLoggedIn}>
      <>
        <Headerinicioregistro />
        <Verificar />
      </>
    </PublicRoute>
  }
/>

            {/* Login */}
            <Route
              path="/iniciar"
              element={
                <PublicRoute isLoggedIn={isLoggedIn}>
                  <>
                    <Headerinicioregistro />
                    <Iniciar setIsLoggedIn={setIsLoggedIn} />
                  </>
                </PublicRoute>
              }
            />

            {/* Mi perfil */}
            <Route
              path="/MiPerfil"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <MiPerfil />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Agregar publicación */}
            <Route
              path="/agregar"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Agregar />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Editar perfil */}
            <Route
              path="/editar"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Editar />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Detalle prenda */}
            <Route
              path="/detalle_prenda/:id"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <DetallePrenda />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Lista de deseos */}
            <Route
              path="/lista_deseos"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <ListaDeDeseos />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/configuracion"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <Configuracion />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Ver perfil de otro usuario */}
            <Route
              path="/perfil/:id_usuario"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <AppPerfiles />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Dashboard de administrador */}
            <Route
              path="/AdminDashboard"
              element={
                <AdminRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                    <AdminDashboard />
                  </Layout>
                </AdminRoute>
              }
            />

              {/* Enviar mensaje (Admin) */}
              <Route
                path="/AdminDashboard/mensaje"
                element={
                  <AdminRoute isLoggedIn={isLoggedIn}>
                    <Layout header={<HeaderAdmin setIsLoggedIn={setIsLoggedIn} />}>
                      <MensajeAdmin />
                    </Layout>
                  </AdminRoute>
                }
              />

            <Route
              path="/gestion_prendas/:id"
              element={
                <PrivateRoute isLoggedIn={isLoggedIn}>
                  <Layout header={<Header setIsLoggedIn={setIsLoggedIn} />}>
                    <GestionarPrenda />
                  </Layout>
                </PrivateRoute>
              }
            />

      

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
