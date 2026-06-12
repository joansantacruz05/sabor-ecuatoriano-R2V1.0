const prisma = require("./prismaClient");

function mapProducto(p) {
  if (!p) return null;
  const { categoria, imagenes, ...rest } = p;
  return {
    ...rest,
    categoria: categoria ? categoria.nombre : null,
    imagenes: imagenes ? imagenes.map(function (i) { return { id: i.id, url: i.url, orden: i.orden }; }).sort(function (a, b) { return a.orden - b.orden; }) : [],
    imagen: imagenes && imagenes.length > 0 ? imagenes.sort(function (a, b) { return a.orden - b.orden; })[0].url : null
  };
}

const includeOpts = {
  categoria: { select: { nombre: true } },
  imagenes: { select: { id: true, url: true, orden: true }, orderBy: { orden: "asc" } }
};

async function findAll() {
  const productos = await prisma.producto.findMany({
    orderBy: { id: "asc" },
    include: includeOpts
  });
  return productos.map(mapProducto);
}

async function findById(id) {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: includeOpts
  });
  return mapProducto(p);
}

async function createProducto(data, imagenUrl) {
  const p = await prisma.producto.create({
    data: {
      ...data,
      imagenes: imagenUrl ? { create: { url: imagenUrl, orden: 0 } } : undefined
    },
    include: includeOpts
  });
  return mapProducto(p);
}

async function updateProducto(id, data, imagenUrl) {
  const updateData = { ...data };
  if (imagenUrl !== null) {
    const existing = await prisma.imagen.findFirst({ where: { productoId: id, orden: 0 } });
    if (existing) {
      await prisma.imagen.update({ where: { id: existing.id }, data: { url: imagenUrl } });
    } else {
      await prisma.imagen.create({ data: { productoId: id, url: imagenUrl, orden: 0 } });
    }
  }
  const p = await prisma.producto.update({
    where: { id },
    data: updateData,
    include: includeOpts
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
