import express, { Router } from "express";
import { db } from "../index.js";
import { verifyToken } from "./Login.js";


const router = express.Router();

router.use(verifyToken);


router.get("/", async (req, res) =>{

     try {

        const query = `
        SELECT 
        m.id,
        m.producto_id,
        p.nombre as producto_nombre,
        p.sku as producto_sku,
        m.tipo,
        m.cantidad,
        m.motivo,
        m.fecha
        FROM movimientos_stock as m
        INNER JOIN productos p on m.producto_id = p.id 
        ORDER BY m.fecha ASC;
        
        `
        const result = await db.query(query);
        res.json(result.rows);

        
     } catch (error) {
          console.error("Error al obtener movimientos:", error);
        res.status(500).json({ error: "Error al obtener el historial de movimientos" });        
     }

})

router.post("/", async (req, res) => {
    
    const { producto_id, tipo, cantidad, motivo } = req.body;

    // Validamos campos obligatorios
    if (!producto_id || !tipo || !cantidad) {
        return res.status(400).json({ error: "Faltan campos obligatorios (producto_id, tipo, cantidad)" });
    }

    // Validamos que el tipo sea ENTRADA o SALIDA
    if (tipo !== 'ENTRADA' && tipo !== 'SALIDA') {
        return res.status(400).json({ error: "El tipo de movimiento debe ser 'ENTRADA' o 'SALIDA'" });
    }

    try {
        //  Verificar si el producto existe y obtener su stock actual
        const productoCheck = await db.query("SELECT stock_actual FROM productos WHERE id = $1", [producto_id]);
        
        if (productoCheck.rowCount === 0) {
            return res.status(404).json({ error: "El producto no existe" });
        }

        let stockActual = productoCheck.rows[0].stock_actual;

        // Calcular el nuevo stock según el tipo de movimiento
        let nuevoStock = stockActual;
        if (tipo === 'ENTRADA') {
            nuevoStock += parseInt(cantidad);
        } else if (tipo === 'SALIDA') {
            if (stockActual < cantidad) {
                return res.status(400).json({ error: "Stock insuficiente para realizar esta salida" });
            }
            nuevoStock -= parseInt(cantidad);
        }

        // ACTUALIZAR EL STOCK EN LA TABLA PRODUCTOS
        await db.query("UPDATE productos SET stock_actual = $1 WHERE id = $2", [nuevoStock, producto_id]);

        //  INSERTAR EL REGISTRO EN LA TABLA MOVIMIENTOS
        const insertQuery = `
            INSERT INTO movimientos_stock (producto_id, tipo, cantidad, motivo)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(insertQuery, [producto_id, tipo, cantidad, motivo || null]);

        // Devolvemos el movimiento creado y el nuevo stock para que React se actualice
        res.status(201).json({
            mensaje: "Movimiento registrado con éxito",
            movimiento: result.rows[0],
            nuevoStock: nuevoStock
        });

    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar el movimiento" });
    }
});




export default  router