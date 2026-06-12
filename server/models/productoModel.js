const prisma = require("./prismaClient");

function mapProducto(p) {
  if (!p) return null;
  const { categoria, ...rest } = p;
  return { ...rest, categoria: categoria ? categoria.nombre : null };
}

async function findAll() {
  const productos = await prisma.producto.findMany({
    orderBy: { id: "asc" },
    include: { categoria: { select: { nombre: true } } }
  });
  return productos.map(mapProducto);
}

async function findById(id) {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: { select: { nombre: true } } }
  });
  return mapProducto(p);
}

async function createProducto(data) {
  const p = await prisma.producto.create({
    data,
    include: { categoria: { select: { nombre: true } } }
  });
  return mapProducto(p);
}

async function updateProducto(id, data) {
  const p = await prisma.producto.update({
    where: { id },
    data,
    include: { categoria: { select: { nombre: true } } }
  });
  return mapProducto(p);
}

async function deleteProducto(id) {
  return prisma.producto.delete({ where: { id } });
}

async function decrementStock(productoId, cantidad) {
  return prisma.producto.update({
    where: { id: productoId },
    data: { stock: { decrement: cantidad } }
  });
}

module.exports = {
  findAll,
  findById,
  createProducto,
  updateProducto,
  deleteProducto,
  decrementStock
};
