import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Pages/Dashboard';
import Productos from './Pages/Productos';
import Movimientos from './Pages/Movimientos';

export default function App() {
  
  const [vista, setVista] = useState('dashboard');

  const renderVista = () => {
    switch (vista) {
      case 'dashboard':
        return <Dashboard />;
      case 'productos':
        return <Productos />;
      case 'movimientos':
        return <Movimientos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar setVista={setVista} vistaActual={vista} />
      <main className="main-content">
        {renderVista()}
      </main>
    </div>
  );
}