import React, { useState, useEffect } from 'react';

export default function Movimientos() {
  // ============================================
  // ESTADOS
  // ============================================
  const [movimientos, setMovimientos] = useState([]);   // Historial de movimientos
  const [productos, setProductos] = useState([]);       // Productos para el <select>
  const [formData, setFormData] = useState({             // Formulario de nuevo movimiento
    producto_id: '',
    tipo: 'ENTRADA',
    cantidad: '',
    motivo: ''
  });
  const [mensaje, setMensaje] = useState('');            // Mensaje de feedback al usuario

  // ============================================
  // EFECTOS: Carga inicial
  // ============================================
  useEffect(() => {
    obtenerMovimientos();
    obtenerProductos();
  }, []);

  // ============================================
  // PETICIONES A LA API
  // ============================================

  /** Obtiene todos los movimientos desde /api/movimientos */
  const obtenerMovimientos = async () => {
    try {
      const res = await fetch('/api/movimientos');
      const data = await res.json();
      
      // Si el backend falla (Error 500), 'data' puede no ser un array.
      // Solo guardamos en el estado si la respuesta es una lista válida.
      if (res.ok && Array.isArray(data)) {
        setMovimientos(data);
      } else {
        console.error('El backend no devolvió un array de movimientos:', data);
        setMovimientos([]); // Mantenemos un array vacío seguro
      }
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      setMovimientos([]);
    }
  };

  /** Obtiene productos para llenar el <select> del formulario */
  const obtenerProductos = async () => {
    try {
      const res = await fetch('/api/productos');
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setProductos(data);
      } else {
        console.error('El backend no devolvió un array de productos:', data);
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProductos([]);
    }
  };

  /** Envía el formulario para registrar un nuevo movimiento (POST) */
  const registrarMovimiento = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cantidad: parseInt(formData.cantidad)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(`Error: ${data.error || 'No se pudo registrar'}`);
        return;
      }

      // Feedback de éxito y recarga de datos
      setMensaje(`Movimiento registrado con éxito.`);
      setFormData({ producto_id: '', tipo: 'ENTRADA', cantidad: '', motivo: '' });
      obtenerMovimientos();
      obtenerProductos(); // Para actualizar el stock visible en el select
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      setMensaje('Error de conexión con el servidor.');
    }
  };

  /** Actualiza el campo correspondiente del formulario */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ============================================
  // UTILIDADES
  // ============================================

  /** Formatea una fecha ISO a locale argentino */
  const formatearFecha = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    <div className="page">
      <h1 className="page-title">Movimientos de Inventario</h1>

      {/* SECCIÓN: Formulario para registrar movimiento */}
      <section className="card form-card">
        <h2>Registrar Movimiento</h2>
        <form onSubmit={registrarMovimiento}>
          <div className="form-row">
            <div className="form-group">
              <label>Producto *</label>
              <select name="producto_id" value={formData.producto_id} onChange={handleChange} required>
                <option value="">Seleccione un producto...</option>
                {Array.isArray(productos) && productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (SKU: {p.sku}) — Stock: {p.stock_actual}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad *</label>
              <input
                name="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Motivo</label>
              <input
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                placeholder="Opcional..."
              />
            </div>
            <div className="form-group align-end">
              <button type="submit" className="btn btn-primary">
                Registrar
              </button>
            </div>
          </div>
        </form>

        {/* Mensaje de feedback */}
        {mensaje && (
          <p className={`feedback ${mensaje.startsWith('Error') ? 'feedback-error' : 'feedback-success'}`}>
            {mensaje}
          </p>
        )}
      </section>

      {/* SECCIÓN: Historial de movimientos */}
      <section className="card">
        <h2>Historial de Movimientos</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(movimientos) || movimientos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No hay movimientos registrados o el servidor falló.</td>
                </tr>
              ) : (
                movimientos.map(m => (
                  <tr key={m.id}>
                    <td>{formatearFecha(m.fecha)}</td>
                    <td>{m.producto_nombre || 'Producto desconocido'}</td>
                    <td>{m.producto_sku || '—'}</td>
                    <td>
                      <span className={`badge badge-${m.tipo ? m.tipo.toLowerCase() : 'entrada'}`}>
                        {m.tipo || 'ENTRADA'}
                      </span>
                    </td>
                    <td>{m.cantidad}</td>
                    <td>{m.motivo || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}