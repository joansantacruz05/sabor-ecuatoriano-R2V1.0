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

const forgotRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Correo inválido")
];

const resetRules = [
  body("token").notEmpty().withMessage("Token requerido"),
  body("password").isLength({ min: 8, max: 100 }).withMessage("La contraseña debe tener al menos 8 caracteres")
];

router.post("/register", registerRules, handleValidation, authController.register);
router.post("/login", loginRules, handleValidation, authController.login);
router.post("/forgot-password", forgotRules, handleValidation, authController.forgotPassword);
router.post("/reset-password", resetRules, handleValidation, authController.resetPassword);
router.get("/me", authenticate, authController.me);

module.exports = router;
