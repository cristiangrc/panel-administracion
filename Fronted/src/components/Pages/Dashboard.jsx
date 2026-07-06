import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  // Estado para los contadores de /resumen
  const [resumen, setResumen] = useState({ totalproductos: 0, totalcategorias: 0, stockbajo: 0, sinstock: 0 });
  const [productosBajos, setProductosBajos] = useState([]);
  const [productosRecientes, setProductosRecientes] = useState([]);

  useEffect(() => {
    obtenerResumen();
    obtenerProductos();
    obtenerStock();
  }, []);

  const obtenerResumen = async () => {
    try {
      const response = await fetch("/api/dashboard/resumen");
      const data = await response.json();
      setResumen(data);
    } catch (error) {
      console.error("error al obtener los resumen del dashboard", error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const response = await fetch("/api/dashboard/productos-recientes");
      const data = await response.json();
      if (Array.isArray(data)) setProductosRecientes(data);
    } catch (error) {
      console.error("error al obtener los productos recientes", error);
    }
  };

  const obtenerStock = async () => {
    try {
      const response = await fetch("/api/dashboard/productos-stock-bajo");
      const data = await response.json();
      if (Array.isArray(data)) setProductosBajos(data);
    } catch (error) {
      console.error("Error al obtener productos con stock bajo", error);
    }
  };

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Panel de Control</h1>
      
      {/* Bloque de Tarjetas Informativas */}
      <div className="dashboard-grid">
        <div className="card">
          <h3>📦 Productos</h3>
          <p>{resumen.totalproductos}</p>
        </div>
        <div className="card">
          <h3>📁 Categorías</h3>
          <p>{resumen.totalcategorias}</p>
        </div>
        <div className="card card-warning">
          <h3>⚠️ Stock Bajo</h3>
          <p>{resumen.stockbajo}</p>
        </div>
        <div className="card card-danger">
          <h3>🚨 Sin Stock</h3>
          <p>{resumen.sinstock}</p>
        </div>
      </div>

      {/* Contenedor de las secciones inferiores */}
      <div className="dashboard-sections">
        
        {/* Tabla o lista de Alertas */}
        <div className="dashboard-alerts">
          <h2>Alertas de Stock Bajo</h2>
          {productosBajos.length === 0 ? (
            <p className="no-data">Todo el inventario se encuentra en niveles óptimos.</p>
          ) : (
            <ul className="alerts-list">
              {productosBajos.map(p => (
                <li key={p.id} className="alert-item">
                  {p.nombre} (SKU: {p.sku}) — Stock Actual: <strong>{p.stock_actual}</strong> (Mínimo requerido: {p.stock_minimo})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mapeo de Productos Recientes*/}
        <div className="dashboard-recents">
          <h2>Últimos Productos Agregados</h2>
          {productosRecientes.length === 0 ? (
            <p className="no-data">No hay productos agregados recientemente.</p>
          ) : (
            <ul className="recents-list">
              {productosRecientes.map(p => (
                <li key={p.id} className="recent-item">
                  <span>{p.nombre}</span> — <strong>${p.precio}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}