const AppController = (function () {
  "use strict";

  function init() {
    const user = AuthModel.getUser();
    UiView.actualizarNavUsuario(user);

    if (localStorage.getItem("saborec_cookies") === "aceptadas") {
      $("#banner-cookies").hide();
    }

    $(window).on("scroll", function () {
      $(".site-header").toggleClass("scrolled", $(window).scrollTop() > 10);
    });

    $("#btn-aceptar-cookies").on("click", function () {
      localStorage.setItem("saborec_cookies", "aceptadas");
      $("#banner-cookies").fadeOut();
    });
    $("#btn-rechazar-cookies").on("click", function () {
      $("#banner-cookies").fadeOut();
    });

    $(document).on("click", ".enlace-tab", function (e) {
      e.preventDefault();
      const tab = $(this).data("tab");
      if (!tab) return;
      window.location.href = tab + ".html";
    });

    CarritoController.init();
    UiView.actualizarNavUsuario(user);
    CarritoView.renderDrawer();
  }

  return { init };
})();

$(document).ready(function () {
  AppController.init();
});
