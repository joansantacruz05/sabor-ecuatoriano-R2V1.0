const express = require("express");
const { body, param } = require("express-validator");
const productoController = require("../controllers/productoController");
const handleValidation = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const productoRules = [
  body("nombre").trim().escape().isLength({ min: 2, max: 100 }).withMessage("Nombre inválido"),
  body("precio").isFloat({ min: 0.01 }).withMessage("Precio inválido"),
  body("stock").isInt({ min: 0 }).withMessage("Stock inválido"),
  body("categoria").optional().trim().escape().isLength({ max: 50 }),
  body("descripcion").optional().trim().escape().isLength({ max: 500 }),
  body("imagen").optional({ values: "falsy" }).trim()
];

const idParam = [param("id").isInt({ min: 1 }).withMessage("ID inválido")];

router.get("/", productoController.listar);
router.get("/:id", idParam, handleValidation, productoController.obtener);

router.post("/", authenticate, authorize("admin"), productoRules, handleValidation, productoController.crear);
router.put("/:id", authenticate, authorize("admin"), idParam, productoRules, handleValidation, productoController.actualizar);
router.delete("/:id", authenticate, authorize("admin"), idParam, handleValidation, productoController.eliminar);

module.exports = router;
