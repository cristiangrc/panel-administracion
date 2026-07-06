import express from "express";
import { db } from "../index.js"; 

const router = express.Router();

router.get("/", async (req, res) => {
     try {
        const query = `
            SELECT 
                p.id, 
                p.sku, 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.stock_actual, 
                p.stock_minimo, 
                p.categoria_id,
                c.nombre AS categoria_nombre
            FROM productos p
            INNER JOIN categorias c ON p.categoria_id = c.id
        `;

        const result = await db.query(query);
        res.json(result.rows);
        
     } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error en obtener los productos" });
     }
});

router.post("/", async (req, res) =>{

    const {sku,nombre,descripcion,precio,stock_actual,stock_minimo,categoria_id} = req.body
    //validaciones de campos obligatorios
    if (!sku || !nombre || !categoria_id || !precio ) {
        return res.status(400).json({ error: "Faltan campos obligatorios (sku, nombre, precio, categoria_id)" });
    }

    try {
        
        const query = `
            INSERT INTO productos (sku, nombre, descripcion, precio, stock_actual, stock_minimo, categoria_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            sku, 
            nombre, 
            descripcion || null, 
            precio, 
            stock_actual || 0,   
            stock_minimo || 5,   
            categoria_id
        ];

        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error al crear producto:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "El SKU ya existe en el sistema" });
        }
        res.status(500).json({ error: "Error interno al guardar el producto" });
    }
})

router.put("/:id", async (req,res)=>{

    const { id } = req.params; 
    const { sku, nombre, descripcion, precio, stock_actual, stock_minimo, categoria_id } = req.body;

    if (!sku || !nombre || !precio || !categoria_id) {
        return res.status(400).json({ error: "Faltan campos obligatorios para actualizar" });
    }

    try {
        
        const query = `
        
           UPDATE productos 
           SET sku = $1,
           nombre = $2,
           decripcion = $3,
           precio = $4,
           stock_actual = $5,
           stock_minimo = $6,
           categoria_id = $7
           WHERE id = $8
           RETURNING *;
        
        `
        const values = [sku, nombre, descripcion || null, precio, stock_actual, stock_minimo, categoria_id, id];
        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(result.rows[0]);
   
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "El SKU ya está en uso por otro producto" });
        }
        res.status(500).json({ error: "Error interno al actualizar el producto" });
    }

})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM productos WHERE id = $1 RETURNING *;`;
        const result = await db.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto eliminado correctamente", productoEliminado: result.rows[0] });

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error interno al eliminar el producto" });
    }
});



export default router; 