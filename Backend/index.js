import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

// 1. IMPORTAR LAS RUTAS (Creamos este archivo en el siguiente paso)
import productosRouter from "./routes/productos.js"; 
import categoriasRouter from "./routes/categorias.js";
import dashboardRouter from "./routes/dashboard.js";
import movimientosRouter from "./routes/movimientos.js";

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Configuración de la Base de Datos
export const db = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

db.connect()
  .then(() => console.log("Conectado a la base de datos"))
  .catch((error) => {
    console.error(" Error al conectarse ", error.message);
    process.exit(1);
  });

// 2. ENLAZAR LAS RUTAS
// Le decimos a Express: "Si la URL empieza con /api/productos, maneja todo en productos.js"
app.use("/api/productos", productosRouter);
app.use ("/api/categorias", categoriasRouter);
app.use ("/api/dashboard", dashboardRouter );
app.use ("/api/movimientos", movimientosRouter);

app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" }); // Corregido: es res.sendFile, no app.sendFile
});

app.listen(port, () => {
     console.log(`Backend server is running on http://localhost:${port}`);
});