import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./components/App"
import Dashboard from "./components/Pages/Dashboard"; 
import Movimientos from './components/Pages/Movimientos';
import Productos from './components/Pages/Productos';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

