import React from 'react';

 function Sidebar({ setVista, vistaActual, usuario, onLogout }) {
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
            className={`sidebar-btn ${vistaActual === b.id ? 'active' : ''}`}
          >
            {b.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        {usuario && <p className="sidebar-user">{usuario.nombre}</p>}
        <button className="sidebar-btn sidebar-logout" onClick={onLogout}>
         Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
