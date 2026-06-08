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
    const { username, email, password } = req.body;

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
      role: "user"
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
      role: usuario.role
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

module.exports = { register, login, me };
