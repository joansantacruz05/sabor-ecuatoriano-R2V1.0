const CatalogoController = (function () {
  "use strict";

  let productos = [];

  async function cargar() {
    CatalogoView.mostrarCargando();
    try {
      productos = await ProductoModel.listar();
      CatalogoView.render(productos);
    } catch (err) {
      CatalogoView.mostrarError("⚠️ " + err.message);
    }
  }

  function init() {
    $(document).on("click", ".btn-filtro", function (e) {
      e.preventDefault();
      const cat = $(this).data("categoria");
      CatalogoView.cambiarCategoria(cat);
      CatalogoView.render(productos);
    });

    $(document).on("click", ".btn-anadir", function () {
      if (!AuthModel.isLoggedIn()) {
        UiView.abrirModal("modal-login");
        return;
      }

      const id = parseInt($(this).data("id"), 10);
      const producto = productos.find(function (p) { return p.id === id; });
      if (!producto) return;

      const ok = CarritoModel.agregar(producto);
      if (!ok) {
        UiView.mostrarAlerta("No hay más stock disponible para " + producto.nombre, "error");
        return;
      }

      CarritoView.renderDrawer();
      CarritoView.renderResumenPedir();
      UiView.mostrarAlerta(producto.nombre + " añadido al carrito.", "ok");
    });

    $(document).on("click", "#btn-cerrar-login, #modal-login-overlay", function () {
      UiView.cerrarModal("modal-login");
    });
  }

  return { init, cargar };
})();
