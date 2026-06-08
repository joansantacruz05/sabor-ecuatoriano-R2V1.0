const prisma = require("./prismaClient");

async function findAll() {
  return prisma.producto.findMany({ orderBy: { id: "asc" } });
}

async function findById(id) {
  return prisma.producto.findUnique({ where: { id } });
}

async function createProducto(data) {
  return prisma.producto.create({ data });
}

async function updateProducto(id, data) {
  return prisma.producto.update({ where: { id }, data });
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
