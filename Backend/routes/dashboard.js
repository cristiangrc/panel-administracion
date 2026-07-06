import express from "express";
import { db } from "../index.js";

const router = express.Router();

router.get("/resumen", async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*)::int FROM productos) AS totalproductos,
                (SELECT COUNT(*)::int FROM categorias) AS totalcategorias,
                (SELECT COUNT(*)::int FROM productos WHERE stock_actual <= stock_minimo) AS stockbajo,
                (SELECT COUNT(*)::int FROM productos WHERE stock_actual = 0) AS sinstock
        `;
        
        const result = await db.query(query);
        
        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error al obtener resumen del dashboard:", error);
        res.status(500).json({ error: "Error al obtener el resumen del dashboard" });
    }
});

router.get("/productos-stock-bajo", async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT id, sku, nombre, precio, stock_actual, stock_minimo
            FROM productos
            WHERE stock_actual <= stock_minimo
            ORDER BY (stock_actual::float / NULLIF(stock_minimo, 0)) ASC
            LIMIT 20
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener productos con stock bajo:", error);
        res.status(500).json({ error: "Error al obtener productos con stock bajo" });
    }
});

router.get("/productos-recientes", async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT id, sku, nombre, precio, stock_actual, stock_minimo
            FROM productos
            ORDER BY id DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener productos recientes:", error);
        res.status(500).json({ error: "Error al obtener productos recientes" });
    }
});

export default router;
