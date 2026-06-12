const prisma = require("./prismaClient");

const detalleInclude = {
  detalles: {
    include: {
      producto: {
        select: {
          id: true, nombre: true,
          imagenes: { select: { url: true, orden: true }, orderBy: { orden: "asc" } }
        }
      }
    }
  },
  usuario: {
    select: { id: true, username: true, email: true, nombreCompleto: true, direccion: true, telefono: true, ciudad: true }
  },
  factura: { include: { metodoPago: { select: { nombre: true } } } }
};

async function createPedidoConDetalles(userId, items, total, metodoPagoId) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const producto = await tx.producto.findUnique({
        where: { id: item.productoId }
      });

      if (!producto) {
        throw Object.assign(new Error(`Producto ${item.productoId} no encontrado`), { statusCode: 404 });
      }

      if (producto.stock < item.cantidad) {
        throw Object.assign(
          new Error(`Stock insuficiente para "${producto.nombre}"`),
          { statusCode: 400 }
        );
      }
    }

    const pedido = await tx.pedido.create({
      data: {
        userId,
        total,
        metodoPagoId: metodoPagoId || undefined,
        detalles: {
          create: items.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario
          }))
        }
      },
      include: detalleInclude
    });

    for (const item of items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock: { decrement: item.cantidad } }
      });
    }

    return pedido;
  });
}

async function findByUserId(userId) {
  return prisma.pedido.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: detalleInclude
  });
}

async function findAll() {
  return prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: detalleInclude
  });
}

async function findById(id) {
  return prisma.pedido.findUnique({
    where: { id },
    include: detalleInclude
  });
}

async function actualizarEstado(id, estado) {
  return prisma.pedido.update({
    where: { id },
    data: { estado }
  });
}

async function anularPedido(pedidoId) {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: { detalles: true }
    });
    if (!pedido) throw Object.assign(new Error("Pedido no encontrado"), { statusCode: 404 });

    await tx.pedido.update({
      where: { id: pedidoId },
      data: { estado: "anulado" }
    });

    const factura = await tx.factura.findUnique({ where: { pedidoId } });
    if (factura) {
      await tx.factura.update({
        where: { pedidoId },
        data: { estado: "anulado" }
      });
    }

    for (const d of pedido.detalles) {
      await tx.producto.update({
        where: { id: d.productoId },
        data: { stock: { increment: d.cantidad } }
      });
    }

    return pedido;
  });
}

async function crearFactura(pedidoId) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { detalles: true, metodoPago: true }
  });
  if (!pedido) throw Object.assign(new Error("Pedido no encontrado"), { statusCode: 404 });
  if (pedido.estado !== "aprobado") throw Object.assign(new Error("Solo pedidos aprobados pueden generar factura"), { statusCode: 400 });

  const subtotal = parseFloat((pedido.total / 1.15).toFixed(2));
  const iva = parseFloat((pedido.total - subtotal).toFixed(2));
  const numeroFactura = "FAC-" + pedido.id.toString().padStart(6, "0");
  var fechaVenc = new Date();
  fechaVenc.setDate(fechaVenc.getDate() + 30);

  return prisma.factura.create({
    data: {
      pedidoId: pedido.id,
      numeroFactura,
      subtotal,
      descuento: 0,
      subtotalIva: subtotal,
      iva,
      total: pedido.total,
      metodoPagoId: pedido.metodoPagoId || 1,
      formaPago: "contado",
      moneda: "USD",
      estado: "pendiente",
      fechaVencimiento: fechaVenc,
      usuarioId: pedido.userId
    }
  });
}

module.exports = {
  createPedidoConDetalles,
  findByUserId,
  findAll,
  findById,
  actualizarEstado,
  anularPedido,
  crearFactura
};
