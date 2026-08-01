import React, { useState, useEffect } from 'react';

export default function Productos({ token }) {
 
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock_actual: '',
    stock_minimo: '',
    categoria_id: ''
  });

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await fetch('/api/productos', { headers: authHeaders });
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await fetch('/api/categorias', { headers: authHeaders });
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      stock_actual: parseInt(formData.stock_actual) || 0,
      stock_minimo: parseInt(formData.stock_minimo) || 5,
      categoria_id: parseInt(formData.categoria_id)
    };

    try {
      if (editando) {
        await fetch(`/api/productos/${editando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
      }

      cerrarModal();
      obtenerProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await fetch(`/api/productos/${id}`, { method: 'DELETE', headers: authHeaders });
      obtenerProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const abrirModalCrear = () => {
    setEditando(null);
    setFormData({ sku: '', nombre: '', descripcion: '', precio: '', stock_actual: '', stock_minimo: '', categoria_id: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto) => {
    setEditando(producto.id);
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page">
      <h1 className="page-title">Gestión de Productos</h1>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          + Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">No se encontraron productos.</td>
              </tr>
            ) : (
              productosFiltrados.map(p => (
                <tr key={p.id} className={p.stock_actual <= p.stock_minimo ? 'row-warning' : ''}>
                  <td>{p.sku}</td>
                  <td>{p.nombre}</td>
                  <td>${parseFloat(p.precio).toFixed(2)}</td>
                  <td>{p.stock_actual}</td>
                  <td>{p.stock_minimo}</td>
                  <td>{p.categoria_nombre}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => abrirModalEditar(p)}>Editar</button>
                    <button className="btn btn-sm btn-delete" onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>

            <form onSubmit={guardarProducto}>
              <div className="form-grid">
                <div className="form-group">
                  <label>SKU *</label>
                  <input name="sku" value={formData.sku} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} />
                </div>
                <div className="form-group">
                  <label>Precio *</label>
                  <input name="precio" type="number" step="0.01" min="0" value={formData.precio} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock Actual</label>
                  <input name="stock_actual" type="number" min="0" value={formData.stock_actual} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input name="stock_minimo" type="number" min="0" value={formData.stock_minimo} onChange={handleChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
