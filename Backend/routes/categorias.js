import express from "express";
import { db } from "../index.js"; 
import { verifyToken } from "./Login.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.nombre 
            FROM categorias as c
            ORDER BY c.nombre ASC;
        `;
        
        const result = await db.query(query);
        res.json(result.rows);

    } catch (error) {
        console.error("Error al obtener las categorias:", error);
        res.status(500).json({ error: "Error en obtener las categorias" });
    }
});


router.post("/", async (req, res) => {
    const { nombre } = req.body; 

    // Validación  por si viene vacío
    if (!nombre || nombre.trim() === "") {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }

    try {
        
        const query = `
            INSERT INTO categorias (nombre) 
            VALUES ($1) 
            RETURNING *;
        `;
        
        const result = await db.query(query, [nombre.trim()]);
        
        
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error al crear la categoría:", error);
        
        // Validación por si intentan meter una categoría duplicada 
        if (error.code === '23505') { 
            return res.status(400).json({ error: "Esta categoría ya existe" });
        }

        res.status(500).json({ error: "Error en el servidor al crear la categoría" });
    }
});

export default router;