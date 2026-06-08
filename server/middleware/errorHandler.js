const logger = require("../logger");

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada"
  });
}

function errorHandler(err, req, res, next) {
  logger.error("Error en la aplicación", {
    path: req.path,
    method: req.method,
    message: err.message
  });

  if (err.message === "Origen no permitido por CORS") {
    return res.status(403).json({
      success: false,
      message: "Origen no permitido"
    });
  }

  const status = err.statusCode || 500;
  const response = {
    success: false,
    message: status === 500 ? "Error interno del servidor" : err.message
  };

  if (process.env.NODE_ENV === "development" && status === 500) {
    response.detail = err.message;
  }

  res.status(status).json(response);
}

module.exports = { notFoundHandler, errorHandler };
