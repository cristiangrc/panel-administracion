import React from 'react';

 function Sidebar({ setVista, vistaActual }) {
  const botones = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'productos', label: '📦 Inventario' },
    { id: 'movimientos', label: '🔄 Movimientos' }
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">StockApp</h2>
      <nav className="sidebar-nav">
        {botones.map((b) => (
          <button
            key={b.id}
            onClick={() => setVista(b.id)}
            // Si el botón es el activo, le añade la clase 'active' para que le des un estilo diferente en CSS
            className={`sidebar-btn ${vistaActual === b.id ? 'active' : ''}`}
          >
            {b.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;