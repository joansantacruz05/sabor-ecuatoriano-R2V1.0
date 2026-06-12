const pedidoModel = require("../models/pedidoModel");
const prisma = require("../models/prismaClient");
const logger = require("../logger");

async function crear(req, res, next) {
  try {
    const { items, metodoPagoId } = req.body;

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
      total,
      metodoPagoId ? parseInt(metodoPagoId, 10) : null
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

async function aprobar(req, res, next) {
  try {
    const { id } = req.params;
    const estado = req.body.estado;

    if (!["aprobado", "rechazado"].includes(estado)) {
      return res.status(400).json({ success: false, message: "Estado debe ser 'aprobado' o 'rechazado'" });
    }

    const pedido = await pedidoModel.findById(parseInt(id, 10));
    if (!pedido) {
      return res.status(404).json({ success: false, message: "Pedido no encontrado" });
    }

    await pedidoModel.actualizarEstado(parseInt(id, 10), estado);

    if (estado === "aprobado") {
      await pedidoModel.crearFactura(parseInt(id, 10));
    }

    res.json({ success: true, message: "Estado actualizado a " + estado });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
}

async function anular(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = await pedidoModel.findById(parseInt(id, 10));
    if (!pedido) return res.status(404).json({ success: false, message: "Pedido no encontrado" });

    await pedidoModel.anularPedido(parseInt(id, 10));
    logger.info("Pedido anulado", { pedidoId: parseInt(id, 10) });
    res.json({ success: true, message: "Pedido anulado correctamente. Stock restaurado." });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

async function listarMetodosPago(req, res, next) {
  try {
    const metodos = await prisma.metodoPago.findMany({ orderBy: { id: "asc" } });
    res.json({ success: true, data: metodos });
  } catch (err) {
    next(err);
  }
}

async function obtenerFactura(req, res, next) {
  try {
    const pedidoId = parseInt(req.params.id, 10);
    const factura = await prisma.factura.findUnique({
      where: { pedidoId },
      include: {
        metodoPago: { select: { nombre: true } },
        pedido: {
          include: {
            detalles: { include: { producto: { include: { imagenes: { orderBy: { orden: "asc" } } } } } },
            usuario: { select: { id: true, username: true, email: true, nombreCompleto: true, direccion: true, telefono: true, ciudad: true } }
          }
        }
      }
    });
    if (!factura) return res.status(404).json({ success: false, message: "Factura no encontrada" });
    res.json({ success: true, data: factura });
  } catch (err) {
    next(err);
  }
}

async function descargarFacturaPdf(req, res, next) {
  try {
    const pedidoId = parseInt(req.params.id, 10);
    const factura = await prisma.factura.findUnique({
      where: { pedidoId },
      include: {
        metodoPago: { select: { nombre: true } },
        pedido: {
          include: {
            detalles: { include: { producto: true } },
            usuario: { select: { id: true, username: true, email: true, nombreCompleto: true, direccion: true, telefono: true, ciudad: true } }
          }
        }
      }
    });
    if (!factura) return res.status(404).json({ success: false, message: "Factura no encontrada" });

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=factura_" + factura.numeroFactura + ".pdf");
    doc.pipe(res);

    var usr = factura.pedido.usuario;
    var fec = new Date(factura.createdAt).toLocaleDateString("es-EC");
    var fecVen = factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString("es-EC") : "—";

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("SABOR ECUATORIANO", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(8).font("Helvetica").text(factura.razonSocial, { align: "center" });
    doc.text("RUC: " + factura.ruc, { align: "center" });
    doc.text(factura.direccionNegocio, { align: "center" });
    doc.text("Tel: " + factura.telefonoNegocio + " | Email: " + factura.emailNegocio, { align: "center" });
    doc.moveDown(1);

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.8);

    // Invoice info
    doc.fontSize(14).font("Helvetica-Bold").text("FACTURA " + factura.numeroFactura, { align: "right" });
    doc.moveDown(0.2);
    doc.fontSize(9).font("Helvetica");
    doc.text("Fecha emisión: " + fec, { align: "right" });
    doc.text("Fecha vencimiento: " + fecVen, { align: "right" });
    doc.text("Método de pago: " + (factura.metodoPago ? factura.metodoPago.nombre : "—"), { align: "right" });
    doc.text("Forma de pago: " + factura.formaPago, { align: "right" });
    doc.moveDown(0.8);

    // Client data
    doc.fontSize(10).font("Helvetica-Bold").text("DATOS DEL CLIENTE");
    doc.moveDown(0.2);
    doc.fontSize(9).font("Helvetica");
    doc.text("Cliente: " + (usr.nombreCompleto || usr.username));
    doc.text("Email: " + usr.email);
    if (usr.direccion) doc.text("Dirección: " + usr.direccion);
    if (usr.ciudad) doc.text("Ciudad: " + usr.ciudad);
    if (usr.telefono) doc.text("Teléfono: " + usr.telefono);
    doc.moveDown(0.8);

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.5);

    // Table header
    var tableTop = doc.y;
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Cant.", 50, tableTop, { width: 40 });
    doc.text("Producto", 90, tableTop, { width: 200 });
    doc.text("P.Unitario", 290, tableTop, { width: 80, align: "right" });
    doc.text("Total", 440, tableTop, { width: 100, align: "right" });

    doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor("#cccccc").stroke();
    doc.moveDown(0.4);

    // Table rows
    doc.font("Helvetica").fontSize(9);
    for (var d of factura.pedido.detalles) {
      var y = doc.y;
      doc.text(String(d.cantidad), 50, y, { width: 40 });
      doc.text(d.producto.nombre, 90, y, { width: 200 });
      doc.text("$" + d.precioUnitario.toFixed(2), 290, y, { width: 80, align: "right" });
      var lineTotal = d.cantidad * d.precioUnitario;
      doc.text("$" + lineTotal.toFixed(2), 440, y, { width: 100, align: "right" });
      doc.moveDown(1);
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.5);

    // Totals
    var totalX = 340;
    var valorX = 440;
    doc.fontSize(10).font("Helvetica");

    doc.text("Subtotal:", totalX, doc.y, { width: 100, align: "right" });
    doc.text("$" + factura.subtotal.toFixed(2), valorX, doc.y - 12, { width: 100, align: "right" });
    doc.moveDown(0.6);

    doc.text("Descuento:", totalX, doc.y, { width: 100, align: "right" });
    doc.text("$" + factura.descuento.toFixed(2), valorX, doc.y - 12, { width: 100, align: "right" });
    doc.moveDown(0.6);

    doc.text("Subtotal IVA (15%):", totalX, doc.y, { width: 100, align: "right" });
    doc.text("$" + factura.subtotalIva.toFixed(2), valorX, doc.y - 12, { width: 100, align: "right" });
    doc.moveDown(0.6);

    doc.text("IVA (15%):", totalX, doc.y, { width: 100, align: "right" });
    doc.text("$" + factura.iva.toFixed(2), valorX, doc.y - 12, { width: 100, align: "right" });
    doc.moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(13);
    doc.text("TOTAL:", totalX, doc.y, { width: 100, align: "right" });
    doc.text("$" + factura.total.toFixed(2), valorX, doc.y - 16, { width: 100, align: "right" });
    doc.moveDown(1.5);

    // Separator before footer
    doc.moveTo(200, doc.y).lineTo(395, doc.y).strokeColor("#dddddd").stroke();
    doc.moveDown(0.8);

    // Footer
    doc.fontSize(8).font("Helvetica").fillColor("#888888");
    doc.text("Estado: " + factura.estado.toUpperCase(), { align: "center" });
    doc.text("Moneda: " + factura.moneda, { align: "center" });
    if (factura.observaciones) doc.text("Observaciones: " + factura.observaciones, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(7).text("Documento generado electrónicamente el " + new Date().toLocaleString("es-EC"), { align: "center" });
    doc.text("www.saborecuatoriano.ec", { align: "center" });

    doc.end();
  } catch (err) {
    next(err);
  }
}

async function reportes(req, res, next) {
  try {
    const { periodo } = req.query;
    const ahora = new Date();
    let fechaInicio;

    switch (periodo) {
      case "diario":
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        break;
      case "semanal":
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ahora.getDay());
        break;
      case "mensual":
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case "anual":
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    }

    const pedidos = await pedidoModel.findAll();
    const aprobados = pedidos.filter(function (p) {
      return new Date(p.createdAt) >= fechaInicio && p.estado === "aprobado";
    });
    const anulados = pedidos.filter(function (p) {
      return new Date(p.createdAt) >= fechaInicio && p.estado === "anulado";
    });
    const pendientes = pedidos.filter(function (p) {
      return new Date(p.createdAt) >= fechaInicio && p.estado === "pendiente";
    });

    const totalVentas = aprobados.reduce(function (sum, p) { return sum + p.total; }, 0);
    const totalAnulados = anulados.reduce(function (sum, p) { return sum + p.total; }, 0);

    var ventasPorDia = {};
    aprobados.forEach(function (p) {
      var dia = new Date(p.createdAt).toISOString().split("T")[0];
      ventasPorDia[dia] = (ventasPorDia[dia] || 0) + p.total;
    });

    var productosVendidos = {};
    aprobados.forEach(function (p) {
      (p.detalles || []).forEach(function (d) {
        var nombre = d.producto ? d.producto.nombre : "Producto #" + d.productoId;
        productosVendidos[nombre] = (productosVendidos[nombre] || 0) + d.cantidad;
      });
    });

    var topProductos = Object.keys(productosVendidos)
      .map(function (k) { return { producto: k, cantidad: productosVendidos[k] }; })
      .sort(function (a, b) { return b.cantidad - a.cantidad; })
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        periodo: periodo || "diario",
        fechaInicio: fechaInicio.toISOString().split("T")[0],
        fechaFin: ahora.toISOString().split("T")[0],
        totalVentas: Math.round(totalVentas * 100) / 100,
        totalAnulados: Math.round(totalAnulados * 100) / 100,
        cantidadPedidos: aprobados.length,
        cantidadAnulados: anulados.length,
        cantidadPendientes: pendientes.length,
        topProductos: topProductos,
        ventasPorDia: ventasPorDia,
        pedidos: aprobados
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, misPedidos, listarTodos, aprobar, anular, reportes, obtenerFactura, descargarFacturaPdf, listarMetodosPago };
