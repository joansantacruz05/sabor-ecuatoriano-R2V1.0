const pedidoModel = require("../models/pedidoModel");
const logger = require("../logger");

async function crear(req, res, next) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El pedido debe incluir al menos un producto"
      });
    }

    const itemsNormalizados = items.map((item) => ({
      productoId: parseInt(item.productoId, 10),
      cantidad: parseInt(item.cantidad, 10),
      precioUnitario: parseFloat(item.precioUnitario)
    }));

    for (const item of itemsNormalizados) {
      if (!item.productoId || item.cantidad < 1 || item.precioUnitario <= 0) {
        return res.status(400).json({
          success: false,
          message: "Cada ítem debe tener productoId, cantidad y precioUnitario válidos"
        });
      }
    }

    const subtotal = itemsNormalizados.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0
    );
    const total = Math.round(subtotal * 1.15 * 100) / 100;

    const pedido = await pedidoModel.createPedidoConDetalles(
      req.user.id,
      itemsNormalizados,
      total
    );

    logger.info("Pedido creado", { pedidoId: pedido.id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: "Pedido registrado correctamente",
      data: pedido
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function misPedidos(req, res, next) {
  try {
    const pedidos = await pedidoModel.findByUserId(req.user.id);
    res.json({ success: true, data: pedidos });
  } catch (err) {
    next(err);
  }
}

async function listarTodos(req, res, next) {
  try {
    const pedidos = await pedidoModel.findAll();
    res.json({ success: true, data: pedidos });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, misPedidos, listarTodos };
