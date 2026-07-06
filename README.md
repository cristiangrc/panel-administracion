# Panel de Administración

Este es un sistema de gestión integral que cuenta con un backend desarrollado en **Node.js / Express** y un frontend construido con **React (Vite)**. El proyecto está estructurado de forma independiente para facilitar su mantenimiento y escalabilidad.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Node.js, Express
* **Frontend:** React, Vite, CSS personalizado
* **Base de Datos:** PostgreSQL 

---

## 📁 Estructura del Proyecto

* **Backend:** Contiene la API REST, la configuración del servidor (`index.js`), variables de entorno (`.env`) y las rutas principales:
  * `categorias.js` - Gestión de categorías.
  * `dashboard.js` - Datos generales y estadísticas.
  * `movimientos.js` - Historial de entradas y salidas de stock.
  * `productos.js` - Control del inventario de productos.
* **Frontend:** Aplicación de React creada con Vite. Incluye:
  * `Pages/` - Vistas principales (`Dashboard`, `Movimientos`, `Productos`).
  * `components/` - Componentes reutilizables de la interfaz (como la `Sidebar.jsx`).
  * `styles.css` - Estilos globales de la aplicación.


