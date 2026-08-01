import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Login from './Login';
import Dashboard from './Pages/Dashboard';
import Productos from './Pages/Productos';
import Movimientos from './Pages/Movimientos';

export default function App() {

  const [vista, setVista] = useState('dashboard');
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token') || sessionStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
      setAutenticado(true);
    }
  }, []);

  const handleLogin = (nuevoToken, nuevoUsuario) => {
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    setAutenticado(true);
    setVista('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setAutenticado(false);
  };

  if (!autenticado) {
    return <Login onLogin={handleLogin} />;
  }

  const renderVista = () => {
    switch (vista) {
      case 'dashboard':
        return <Dashboard token={token} />;
      case 'productos':
        return <Productos token={token} />;
      case 'movimientos':
        return <Movimientos token={token} />;
      default:
        return <Dashboard token={token} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar setVista={setVista} vistaActual={vista} usuario={usuario} onLogout={handleLogout} />
      <main className="main-content">
        {renderVista()}
      </main>
    </div>
  );
}
