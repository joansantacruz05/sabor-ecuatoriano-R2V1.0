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

    carrito.forEach(function (item) {
      $body.append(
        '<div class="item-carrito">' +
          '<div class="item-info">' +
            '<h4>' + item.nombre + '</h4>' +
            '<p>$' + (item.precio * item.cantidad).toFixed(2) + '</p>' +
          '</div>' +
          '<div class="item-controles">' +
            '<button type="button" data-accion="restar" data-id="' + item.productoId + '" aria-label="Disminuir">−</button>' +
            '<span>' + item.cantidad + '</span>' +
            '<button type="button" data-accion="sumar" data-id="' + item.productoId + '" aria-label="Aumentar">+</button>' +
            '<button type="button" class="btn-eliminar" data-accion="eliminar" data-id="' + item.productoId + '">Eliminar</button>' +
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
          '<span class="resumen-item-precio">$' + (item.precio * item.cantidad).toFixed(2) + '</span>' +
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
