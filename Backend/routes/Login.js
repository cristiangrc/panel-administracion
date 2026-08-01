import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { db } from "../index.js";


const router = express.Router();

router.post("/", async (req,res) =>{

    const {email,password} = req.body;

    if (!email||!password) {
        return res.status(400).json({error:" el email y contrasena son requeridos"})
    }


    try {
        
const query = `
    SELECT * 
    FROM usuarios 
    WHERE email = $1
`;

const result = await db.query(query, [email]);

        if (result.rows.length == 0) {
            return res.status(401).json({error:"error con las credenciales"})
        }

        const user = result.rows[0];

        const comparar = await bcrypt.compare(password,user.password)
        if (!comparar) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

         const token = jwt.sign(
            {
            id: user.id,
            email: user.email
            },

            process.env.JWT_SECRET,
            {
            expiresIn: "8h"
            }
         );

         return res.json({
            message:"login exitoso",
            token: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
         })

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }

})

router.post("/registro", async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    try {
        const existe = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ error: "Ya existe una cuenta con ese email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email",
            [nombre, email, hashedPassword]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.status(201).json({
            message: "Registro exitoso",
            token,
            user: { id: user.id, nombre: user.nombre, email: user.email }
        });

    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    // 3. Extraer el token (maneja si viene con "Bearer " o solo la cadena)
    const token = authHeader.startsWith("Bearer ")? authHeader.split(" ")[1]: authHeader;

   
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Adjuntar la información del usuario desencriptada al request
    req.user = verified;

    next();
  } catch (error) {
   
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
}


export { verifyToken };
export default  router;
