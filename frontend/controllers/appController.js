const AppController = (function () {
  "use strict";

  function init() {
    const user = AuthModel.getUser();
    UiView.actualizarNavUsuario(user);
    if (typeof PedidoController !== "undefined" && PedidoController.actualizarAvisoLogin) {
      PedidoController.actualizarAvisoLogin();
    }

    $(document).on("click", ".enlace-tab", function (e) {
      e.preventDefault();
      const tab = $(this).data("tab");
      if (!tab) return;
      UiView.cambiarTab(tab);
      if ($("#drawer-carrito").hasClass("abierto")) {
        CarritoView.cerrarDrawer();
      }
      if (tab === "menu") {
        CatalogoController.cargar();
      }
    });

    $(window).on("scroll", function () {
      $(".site-header").toggleClass("scrolled", $(window).scrollTop() > 10);
    });

    AuthController.init();
    CatalogoController.init();
    CarritoController.init();
    PedidoController.init();
    AdminController.init();

    CarritoView.renderDrawer();
    CatalogoController.cargar();
  }

  return { init };
})();

$(document).ready(function () {
  AppController.init();
});
