const { Router } = require("express");
const prisma = require("../models/prismaClient");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" }
    });
    res.json({ success: true, data: categorias });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
