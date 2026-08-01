import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { db } from "../index.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// POST /api/recuperacion/solicitar
// Genera un código de 6 dígitos, lo guarda en BD y lo envía por email
router.post("/solicitar", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El email es requerido" });
  }

  try {
    // Verificar que el usuario exista
    const userCheck = await db.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (userCheck.rows.length === 0) {
    
      return res.json({ message: "Si el email está registrado, recibirás un código de recuperación" });
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiración en 15 minutos
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    // Marcar códigos anteriores del mismo email como usados
    await db.query(
      "UPDATE token_recuperacion SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email]
    );

    // Guardar el nuevo código
    await db.query(
      "INSERT INTO token_recuperacion (email, codigo, expiracion) VALUES ($1, $2, $3)",
      [email, codigo, expiracion]
    );

    // Enviar email
    await transporter.sendMail({
      from: `"StockApp" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña - StockApp",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="background: #2563eb; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 1.5rem;">StockApp</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Recuperación de contraseña</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Recibiste este porque se solicitó un restablecimiento de contraseña para tu cuenta.
            </p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <p style="color: #64748b; margin: 0 0 8px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Tu código es</p>
              <p style="color: #1e293b; font-size: 2rem; font-weight: 700; margin: 0; letter-spacing: 8px;">${codigo}</p>
            </div>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6;">
              Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, podés ignorar este mensaje.
            </p>
          </div>
        </div>
      `,
    });

    return res.json({ message: "Si el email está registrado, recibirás un código de recuperación" });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/recuperacion/verificar
// Valida que el código sea correcto y no esté expirado
router.post("/verificar", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "El email y el código son requeridos" });
  }

  try {
    const result = await db.query(
      `SELECT id FROM token_recuperacion 
       WHERE email = $1 AND codigo = $2 AND used = FALSE AND expiracion > NOW()`,
      [email, codigo]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    return res.json({ message: "Código válido" });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/recuperacion/restablecer
// Cambia la contraseña del usuario
router.post("/restablecer", async (req, res) => {
  const { email, codigo, nuevaPassword } = req.body;

  if (!email || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: "El email, el código y la nueva contraseña son requeridos" });
  }

  if (nuevaPassword.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    // Verificar el código nuevamente
    const tokenCheck = await db.query(
      `SELECT id FROM token_recuperacion 
       WHERE email = $1 AND codigo = $2 AND used = FALSE AND expiracion > NOW()`,
      [email, codigo]
    );

    if (tokenCheck.rows.length === 0) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    // Actualizar la contraseña
    await db.query("UPDATE usuarios SET password = $1 WHERE email = $2", [hashedPassword, email]);

    // Marcar el código como usado
    await db.query(
      "UPDATE token_recuperacion SET used = TRUE WHERE email = $1 AND codigo = $2",
      [email, codigo]
    );

    return res.json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
