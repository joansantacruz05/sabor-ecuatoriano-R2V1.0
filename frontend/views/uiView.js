const UiView = (function () {
  "use strict";

  function mostrarAlerta(mensaje, tipo) {
    const $alerta = $("#alerta-global");
    $alerta
      .removeClass("ok error info")
      .addClass(tipo || "info")
      .text(mensaje)
      .attr("role", "alert")
      .removeAttr("hidden");
  }

  function ocultarAlerta() {
    $("#alerta-global").attr("hidden", true).text("");
  }

  function cambiarTab(tab) {
    $(".tab-panel").removeClass("activa").attr("hidden", true);
    $("#tab-" + tab).addClass("activa").removeAttr("hidden");
    $(".nav-principal a, .nav-mobile a").removeClass("activo");
    $("[data-tab='" + tab + "']").addClass("activo");
    $("html, body").animate({ scrollTop: 0 }, 300);
  }

  function actualizarNavUsuario(user) {
    const $auth = $("#nav-auth");
    const $admin = $("#nav-admin");
    const $misPedidos = $("#nav-mis-pedidos");

    if (user) {
      $auth.html(
        '<span class="nav-usuario" aria-label="Usuario conectado">' + user.username + " (" + user.role + ")</span>" +
        '<button type="button" class="btn btn-secundario btn-sm" id="btn-logout">Cerrar sesión</button>'
      );
      $misPedidos.removeAttr("hidden");
      if (user.role === "admin") {
        $admin.removeAttr("hidden");
      } else {
        $admin.attr("hidden", true);
      }
    } else {
      $auth.html('<button type="button" class="btn btn-secundario btn-sm enlace-tab" data-tab="login">Iniciar sesión</button>');
      $misPedidos.attr("hidden", true);
      $admin.attr("hidden", true);
    }
  }

  function abrirModal(id) {
    const $modal = $("#" + id);
    const $overlay = $("#" + id + "-overlay");
    $modal.prop("hidden", false);
    $overlay.prop("hidden", false);
    setTimeout(function () {
      $modal.addClass("abierto");
      $overlay.addClass("visible");
      $modal.attr("aria-hidden", "false");
    }, 10);
    document.body.style.overflow = "hidden";
  }

  function cerrarModal(id) {
    const $modal = $("#" + id);
    const $overlay = $("#" + id + "-overlay");
    $modal.removeClass("abierto");
    $overlay.removeClass("visible");
    $modal.attr("aria-hidden", "true");
    setTimeout(function () {
      $modal.prop("hidden", true);
      $overlay.prop("hidden", true);
    }, 350);
    document.body.style.overflow = "";
  }

  return {
    mostrarAlerta,
    ocultarAlerta,
    cambiarTab,
    actualizarNavUsuario,
    abrirModal,
    cerrarModal
  };
})();
