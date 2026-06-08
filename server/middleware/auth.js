const jwt = require("jsonwebtoken");
const logger = require("../logger");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token de autenticación requerido"
    });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      role: payload.role
    };
    next();
  } catch (err) {
    logger.warn("JWT inválido o expirado", { error: err.message });
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado"
    });
  }
}

function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción"
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
