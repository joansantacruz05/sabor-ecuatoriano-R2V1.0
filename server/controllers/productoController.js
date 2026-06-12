const prisma = require("../models/prismaClient");
const productoModel = require("../models/productoModel");
const logger = require("../logger");

async function resolverCategoria(body) {
  if (body.categoria !== undefined) {
    const nombre = body.categoria;
    if (nombre) {
      const cat = await prisma.categoria.upsert({
        where: { nombre: nombre },
        update: {},
        create: { nombre: nombre }
      });
      body.categoriaId = cat.id;
    }
    delete body.categoria;
  }
  return body;
}

async function listar(req, res, next) {
  try {
    const productos = await productoModel.findAll();
    res.json({ success: true, data: productos });
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const producto = await productoModel.findById(id);

    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    await resolverCategoria(req.body);
    const { imagen, ...productData } = req.body;
    const producto = await productoModel.createProducto(productData, imagen || null);
    logger.info("Producto creado", { productoId: producto.id });
    res.status(201).json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existente = await productoModel.findById(id);

    if (!existente) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    await resolverCategoria(req.body);
    const { imagen, ...productData } = req.body;
    const producto = await productoModel.updateProducto(id, productData, imagen || null);
    logger.info("Producto actualizado", { productoId: id });
    res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existente = await productoModel.findById(id);

    if (!existente) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    await productoModel.deleteProducto(id);
    logger.info("Producto eliminado", { productoId: id });
    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
