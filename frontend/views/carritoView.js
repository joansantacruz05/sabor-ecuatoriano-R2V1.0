const CarritoView = (function () {
  "use strict";

  function renderDrawer(onActualizar) {
    const carrito = CarritoModel.obtener();
    const totales = CarritoModel.calcularTotales();
    const $body = $("#drawer-body");
    const $footer = $("#drawer-footer");

    $("#contador-carrito").text(totales.cantidadItems);
    $body.empty();

    if (carrito.length === 0) {
      $body.append(
        '<div class="estado-vacio">' +
          '<h3>Tu carrito está vacío</h3>' +
          '<p>Agrega platos del menú para empezar.</p>' +
          '<button type="button" class="btn btn-secundario enlace-tab" data-tab="menu">Ver el menú</button>' +
        '</div>'
      );
      $footer.hide();
      return;
    }

    var maxPorProducto = 10;
    carrito.forEach(function (item) {
      var alMaximo = item.cantidad >= maxPorProducto || item.cantidad >= item.stock;
      $body.append(
        '<div class="item-carrito">' +
          '<div class="item-info">' +
            '<h4>' + item.nombre + '</h4>' +
            '<p>$' + (item.precio * item.cantidad).toFixed(2) + '</p>' +
          '</div>' +
          '<div class="item-controles">' +
            '<button type="button" data-accion="restar" data-id="' + item.productoId + '" aria-label="Disminuir">−</button>' +
            '<span>' + item.cantidad + '</span>' +
            '<button type="button" data-accion="sumar" data-id="' + item.productoId + '" aria-label="Aumentar"' + (alMaximo ? ' disabled' : '') + '>+</button>' +
            '<button type="button" class="btn-eliminar" data-accion="eliminar" data-id="' + item.productoId + '" aria-label="Eliminar ' + item.nombre + '">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    });

    $("#subtotal").text(totales.subtotal);
    $("#iva").text(totales.iva);
    $("#total").text(totales.total);
    $footer.show();
  }

  function renderResumenPedir() {
    const carrito = CarritoModel.obtener();
    const totales = CarritoModel.calcularTotales();
    const $items = $("#resumen-items");
    const $totales = $("#resumen-totales");

    $items.empty();

    if (carrito.length === 0) {
      $items.append('<p class="mensaje-vacio">No hay productos en el carrito.</p>');
      $totales.attr("hidden", true);
      return;
    }

    carrito.forEach(function (item) {
      $items.append(
        '<div class="resumen-item">' +
          '<div><span class="resumen-item-cantidad">' + item.cantidad + '×</span> ' + item.nombre + '</div>' +
          '<div class="resumen-item-acciones">' +
            '<span class="resumen-item-precio">$' + (item.precio * item.cantidad).toFixed(2) + '</span>' +
            '<button type="button" class="btn-eliminar-resumen" data-id="' + item.productoId + '" aria-label="Eliminar ' + item.nombre + '">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    });

    $("#resumen-subtotal").text(totales.subtotal);
    $("#resumen-iva").text(totales.iva);
    $("#resumen-total").text(totales.total);
    $totales.removeAttr("hidden");
  }

  function abrirDrawer() {
    $("#drawer-carrito, #drawer-overlay").prop("hidden", false);
    setTimeout(function () {
      $("#drawer-carrito").addClass("abierto").attr("aria-hidden", "false");
      $("#drawer-overlay").addClass("visible");
    }, 10);
    document.body.style.overflow = "hidden";
    $("#btn-cerrar-carrito").focus();
  }

  function cerrarDrawer() {
    $("#drawer-carrito").removeClass("abierto").attr("aria-hidden", "true");
    $("#drawer-overlay").removeClass("visible");
    setTimeout(function () {
      $("#drawer-carrito, #drawer-overlay").prop("hidden", true);
    }, 500);
    document.body.style.overflow = "";
  }

  return { renderDrawer, renderResumenPedir, abrirDrawer, cerrarDrawer };
})();
