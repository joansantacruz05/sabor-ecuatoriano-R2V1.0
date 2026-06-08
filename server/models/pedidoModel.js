const prisma = require("./prismaClient");

const detalleInclude = {
  detalles: {
    include: {
      producto: {
        select: { id: true, nombre: true, imagen: true }
      }
    }
  },
  usuario: {
    select: { id: true, username: true, email: true }
  }
};

async function createPedidoConDetalles(userId, items, total) {
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

module.exports = {
  createPedidoConDetalles,
  findByUserId,
  findAll
};
