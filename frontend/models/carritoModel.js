const CarritoModel = (function () {
  "use strict";

  const LS_KEY = "saborec_carrito_v2";
  const MAX_POR_PRODUCTO = 10;
  const MAX_TOTAL_ITEMS = 30;

  let carrito = [];

  function cargar() {
    try {
      const data = localStorage.getItem(LS_KEY);
      carrito = data ? JSON.parse(data) : [];
    } catch (e) {
      carrito = [];
    }
    return carrito;
  }

  function guardar() {
    localStorage.setItem(LS_KEY, JSON.stringify(carrito));
    sessionStorage.setItem("saborec_carrito_sesion", String(Date.now()));
  }

  function obtener() {
    return [...carrito];
  }

  function agregar(producto) {
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
    if (totalItems >= MAX_TOTAL_ITEMS) return "límite total alcanzado (máx. " + MAX_TOTAL_ITEMS + " productos en total)";

    const existente = carrito.find((i) => i.productoId === producto.id);
    if (existente) {
      if (existente.cantidad >= MAX_POR_PRODUCTO) return "máximo " + MAX_POR_PRODUCTO + " unidades por producto";
      if (existente.cantidad >= producto.stock) return "stock insuficiente";
      existente.cantidad++;
    } else {
      carrito.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        stock: producto.stock,
        cantidad: 1
      });
    }
    guardar();
    return true;
  }

  function actualizarCantidad(productoId, cantidad) {
    const index = carrito.findIndex((i) => i.productoId === productoId);
    if (index === -1) return;

    if (cantidad <= 0) {
      carrito.splice(index, 1);
    } else {
      const max = Math.min(carrito[index].stock, MAX_POR_PRODUCTO);
      carrito[index].cantidad = Math.min(cantidad, max);
    }
    guardar();
  }

  function eliminar(productoId) {
    carrito = carrito.filter((i) => i.productoId !== productoId);
    guardar();
  }

  function vaciar() {
    carrito = [];
    guardar();
  }

  function calcularTotales() {
    const subtotal = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
    const iva = subtotal * 0.15;
    const total = subtotal + iva;
    const cantidadItems = carrito.reduce((sum, i) => sum + i.cantidad, 0);

    return {
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2),
      cantidadItems
    };
  }

  function toPedidoItems() {
    return carrito.map((i) => ({
      productoId: i.productoId,
      cantidad: i.cantidad,
      precioUnitario: i.precio
    }));
  }

  cargar();

  return {
    cargar,
    obtener,
    agregar,
    actualizarCantidad,
    eliminar,
    vaciar,
    calcularTotales,
    toPedidoItems
  };
})();
