const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");
const logger = require("../logger");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

async function register(req, res, next) {
  try {
    const { username, email, password, nombreCompleto, cedula, direccion, telefono, ciudad } = req.body;

    const existingEmail = await usuarioModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: "El correo ya está registrado" });
    }

    const existingUsername = await usuarioModel.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ success: false, message: "El nombre de usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await usuarioModel.createUsuario({
      username,
      email,
      passwordHash,
      rolId: 2,
      nombreCompleto: nombreCompleto || null,
      cedula: cedula || null,
      direccion: direccion || null,
      telefono: telefono || null,
      ciudad: ciudad || null
    });

    const token = signToken(usuario);
    logger.info("Usuario registrado", { userId: usuario.id });

    res.status(201).json({
      success: true,
      message: "Registro exitoso",
      token,
      user: usuario
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await usuarioModel.findByEmail(email);

    if (!usuario) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const valid = await bcrypt.compare(password, usuario.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const token = signToken(usuario);
    const user = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role,
      nombreCompleto: usuario.nombreCompleto,
      direccion: usuario.direccion,
      telefono: usuario.telefono,
      ciudad: usuario.ciudad
    };

    logger.info("Login exitoso", { userId: usuario.id });

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await usuarioModel.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, user: usuario });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const usuario = await usuarioModel.findByEmail(email);
    if (!usuario) {
      return res.json({ success: true, message: "Si el correo existe, recibirás un enlace de recuperación." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await usuarioModel.setResetToken(email, token, expiresAt);

    logger.info("Password reset token generado", { userId: usuario.id, token });

    res.json({
      success: true,
      message: "Si el correo existe, recibirás un enlace de recuperación.",
      resetToken: token
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await usuarioModel.findByEmail(email);
    if (!usuario || !usuario.resetTokenExpiry || usuario.resetTokenExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "No has solicitado recuperación o el enlace expiró." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await usuarioModel.updatePassword(usuario.id, passwordHash);

    logger.info("Contraseña restablecida", { userId: usuario.id });

    res.json({ success: true, message: "Contraseña actualizada correctamente." });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nombreCompleto, cedula, direccion, telefono, ciudad } = req.body;
    const usuario = await usuarioModel.updateUsuario(req.user.id, {
      nombreCompleto: nombreCompleto || null,
      cedula: cedula || null,
      direccion: direccion || null,
      telefono: telefono || null,
      ciudad: ciudad || null
    });

    res.json({ success: true, message: "Perfil actualizado", user: usuario });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, forgotPassword, resetPassword, updateProfile };
