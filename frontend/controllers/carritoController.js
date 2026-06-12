const CarritoController = (function () {
  "use strict";

  function init() {
    $("#btn-abrir-carrito").on("click", CarritoView.abrirDrawer);
    $("#btn-cerrar-carrito, #drawer-overlay").on("click", CarritoView.cerrarDrawer);

    $(document).on("click", "#drawer-body [data-accion]", function () {
      const id = parseInt($(this).data("id"), 10);
      const accion = $(this).data("accion");
      const item = CarritoModel.obtener().find(function (i) { return i.productoId === id; });

      if (accion === "sumar" && item) {
        CarritoModel.actualizarCantidad(id, item.cantidad + 1);
      } else if (accion === "restar" && item) {
        CarritoModel.actualizarCantidad(id, item.cantidad - 1);
      } else if (accion === "eliminar") {
        CarritoModel.eliminar(id);
      }

      CarritoView.renderDrawer();
      CarritoView.renderResumenPedir();
    });

    $("#btn-vaciar").on("click", function () {
      if (confirm("¿Vaciar el carrito?")) {
        CarritoModel.vaciar();
        CarritoView.renderDrawer();
        CarritoView.renderResumenPedir();
      }
    });

    $(document).on("click", ".btn-eliminar-resumen", function () {
      const id = parseInt($(this).data("id"), 10);
      CarritoModel.eliminar(id);
      CarritoView.renderDrawer();
      CarritoView.renderResumenPedir();
    });

    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $("#drawer-carrito").hasClass("abierto")) {
        CarritoView.cerrarDrawer();
      }
    });
  }

  return { init };
})();
