const express = require("express");
const { body } = require("express-validator");
const pedidoController = require("../controllers/pedidoController");
const handleValidation = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const crearPedidoRules = [
  body("items").isArray({ min: 1 }).withMessage("Debe enviar al menos un ítem"),
  body("items.*.productoId").isInt({ min: 1 }).withMessage("productoId inválido"),
  body("items.*.cantidad").isInt({ min: 1 }).withMessage("cantidad inválida"),
  body("items.*.precioUnitario").isFloat({ min: 0.01 }).withMessage("precioUnitario inválido")
];

router.post("/", authenticate, authorize("user", "admin"), crearPedidoRules, handleValidation, pedidoController.crear);
router.get("/mis-pedidos", authenticate, authorize("user", "admin"), pedidoController.misPedidos);
router.get("/", authenticate, authorize("admin"), pedidoController.listarTodos);

module.exports = router;
