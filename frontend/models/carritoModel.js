const CarritoModel = (function () {
  "use strict";

  const LS_KEY = "saborec_carrito_v2";

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
    const existente = carrito.find((i) => i.productoId === producto.id);
    if (existente) {
      if (existente.cantidad >= producto.stock) return false;
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
    } else if (cantidad <= carrito[index].stock) {
      carrito[index].cantidad = cantidad;
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
