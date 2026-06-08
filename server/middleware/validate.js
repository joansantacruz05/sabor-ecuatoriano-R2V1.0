const { validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Datos de entrada inválidos",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg
      }))
    });
  }

  next();
}

module.exports = handleValidation;
