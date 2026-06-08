const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const handleValidation = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const registerRules = [
  body("username")
    .trim()
    .escape()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/)
    .withMessage("Username: 3-50 caracteres alfanuméricos"),
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Correo electrónico inválido"),
  body("password")
    .isLength({ min: 8, max: 100 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
];

const loginRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Correo inválido"),
  body("password").notEmpty().withMessage("Contraseña requerida")
];

router.post("/register", registerRules, handleValidation, authController.register);
router.post("/login", loginRules, handleValidation, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
