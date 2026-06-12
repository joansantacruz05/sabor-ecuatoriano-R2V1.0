const PedidoController = (function () {
  "use strict";

  async function confirmarPedido() {
    if (!AuthModel.isLoggedIn()) {
      UiView.mostrarAlerta("Debes iniciar sesión para confirmar tu pedido.", "error");
      window.location.href = "login.html";
      return;
    }

    const carrito = CarritoModel.obtener();
    if (carrito.length === 0) {
      UiView.mostrarAlerta("Tu carrito está vacío.", "error");
      return;
    }

    var metodoPagoId = $("#pedir-metodo-pago").val();
    if (!metodoPagoId) {
      UiView.mostrarAlerta("Selecciona un método de pago.", "error");
      return;
    }

    try {
      const pedido = await PedidoModel.crear(CarritoModel.toPedidoItems(), metodoPagoId);
      CarritoModel.vaciar();
      CarritoView.renderDrawer();
      CarritoView.renderResumenPedir();
      PedidosView.mostrarExito(pedido.id);
      UiView.mostrarAlerta("Pedido registrado en la base de datos.", "ok");
    } catch (err) {
      if (err.status === 401) {
        AuthModel.logout();
        UiView.actualizarNavUsuario(null);
        UiView.mostrarAlerta("Tu sesión expiró. Inicia sesión de nuevo.", "error");
        window.location.href = "login.html";
      } else {
        UiView.mostrarAlerta(err.message || "Error al registrar el pedido", "error");
      }
    }
  }

  async function cargarMisPedidos() {
    if (!AuthModel.isLoggedIn()) {
      window.location.href = "login.html";
      return;
    }

    try {
      const pedidos = await PedidoModel.misPedidos();
      PedidosView.renderLista(pedidos, false);
    } catch (err) {
      $("#lista-pedidos").html('<p class="mensaje-vacio" role="alert">' + err.message + '</p>');
    }
  }

  function actualizarAvisoLogin() {
    if (AuthModel.isLoggedIn()) {
      $("#pedir-login-aviso").attr("hidden", true);
    } else {
      $("#pedir-login-aviso").removeAttr("hidden");
    }
  }

  async function cargarTodosPedidos() {
    try {
      const pedidos = await PedidoModel.todos();
      PedidosView.renderLista(pedidos, true);
    } catch (err) {
      $("#lista-pedidos").html('<p class="mensaje-vacio" role="alert">' + err.message + '</p>');
    }
  }

  function cargarDireccion() {
    var user = AuthModel.getUser();
    if (user) {
      $("#pedir-nombre").val(user.nombreCompleto || "");
      $("#pedir-direccion").val(user.direccion || "");
      $("#pedir-ciudad").val(user.ciudad || "");
      $("#pedir-telefono").val(user.telefono || "");
      $(".feedback-inline").text("").removeClass("error");
    }
  }

  function validarCampoTexto(valor, campo) {
    if (/[0-9]/.test(valor)) {
      $("#" + campo + "-feedback").text("No se permiten n\u00fameros.").addClass("error");
      return false;
    }
    return true;
  }

  async function guardarDireccion() {
    if (!AuthModel.isLoggedIn()) {
      UiView.mostrarAlerta("Debes iniciar sesión para guardar tu dirección.", "error");
      return;
    }

    var nombreCompleto = $("#pedir-nombre").val().trim();
    var direccion = $("#pedir-direccion").val().trim();
    var ciudad = $("#pedir-ciudad").val().trim();
    var telefono = $("#pedir-telefono").val().trim();

    if (!validarCampoTexto(nombreCompleto, "pedir-nombre")) return;
    if (!validarCampoTexto(ciudad, "pedir-ciudad")) return;

    var peligro = Sanitize.validar(direccion);
    if (peligro) {
      $("#pedir-direccion").siblings(".feedback-inline").first().text(peligro).addClass("error");
      return;
    }

    if (/[^0-9]/.test(telefono)) {
      $("#pedir-telefono-feedback").text("Solo se permiten d\u00edgitos.").addClass("error");
      return;
    }
    if (telefono.length > 10) {
      $("#pedir-telefono-feedback").text("M\u00e1ximo 10 d\u00edgitos.").addClass("error");
      return;
    }

    var data = {
      nombreCompleto: nombreCompleto,
      direccion: direccion,
      ciudad: ciudad,
      telefono: telefono
    };
    try {
      var res = await ApiModel.put("/auth/profile", data);
      if (res.success) {
        var user = AuthModel.getUser();
        user.nombreCompleto = data.nombreCompleto;
        user.direccion = data.direccion;
        user.ciudad = data.ciudad;
        user.telefono = data.telefono;
        AuthModel.saveSession(AuthModel.getToken(), user);
        $(".feedback-inline").text("").removeClass("error");
        $("#direccion-feedback").removeClass("error").addClass("ok").text("Dirección guardada.");
      }
    } catch (err) {
      $("#direccion-feedback").removeClass("ok").addClass("error").text(err.message || "Error al guardar");
    }
  }

  $(document).on("click", ".btn-descargar-factura", function (e) {
    e.preventDefault();
    var pedidoId = $(this).data("pedido-id");
    var token = AuthModel.getToken();
    if (!token) { UiView.mostrarAlerta("Inicia sesión para descargar", "error"); return; }
    var url = "/api/pedidos/" + pedidoId + "/factura/pdf";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (xhr.status === 200) {
        var blob = xhr.response;
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "factura_" + pedidoId + ".pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        UiView.mostrarAlerta("Error al descargar factura", "error");
      }
    };
    xhr.onerror = function () {
      UiView.mostrarAlerta("Error de conexión al descargar factura", "error");
    };
    xhr.send();
  });

  async function cargarMetodosPago() {
    try {
      var res = await ApiModel.get("/pedidos/metodos-pago");
      var metodos = res.data || [];
      var $sel = $("#pedir-metodo-pago");
      $sel.find("option:not([value=''])").remove();
      metodos.forEach(function (m) {
        $sel.append('<option value="' + m.id + '">' + m.nombre.charAt(0).toUpperCase() + m.nombre.slice(1) + '</option>');
      });
    } catch (e) {
      console.warn("No se pudieron cargar métodos de pago", e);
    }
  }

  function init() {
    actualizarAvisoLogin();
    cargarDireccion();
    cargarMetodosPago();
    $("#btn-confirmar-pedido").on("click", confirmarPedido);
    $("#btn-guardar-direccion").on("click", guardarDireccion);

    $("#pedir-nombre, #pedir-ciudad").on("input", function () {
      var val = $(this).val();
      var fbId = $(this).attr("id") + "-feedback";
      if (/[0-9]/.test(val)) {
        $("#" + fbId).text("No se permiten n\u00fameros.").addClass("error");
      } else {
        $("#" + fbId).text("").removeClass("error");
      }
    });

    $("#pedir-telefono").on("input", function () {
      var val = $(this).val();
      var $fb = $("#pedir-telefono-feedback");
      if (/[^0-9]/.test(val)) {
        $fb.text("Solo se permiten d\u00edgitos.").addClass("error");
      } else if (val.length > 10) {
        $fb.text("M\u00e1ximo 10 d\u00edgitos.").addClass("error");
      } else {
        $fb.text("").removeClass("error");
      }
    });

    $(document).on("click", ".enlace-tab[data-tab='mis-pedidos']", function () {
      cargarMisPedidos();
    });

    $(document).on("click", ".enlace-tab[data-tab='pedir']", function () {
      if (!AuthModel.isLoggedIn()) {
        UiView.mostrarAlerta("Inicia sesión para realizar tu pedido.", "info");
      }
      CarritoView.renderResumenPedir();
    });

    $("#btn-cerrar-exito, #modal-exito-overlay").on("click", function () {
      UiView.cerrarModal("modal-exito");
      window.location.href = "mis-pedidos.html";
    });
  }

  return { init, confirmarPedido, cargarMisPedidos, actualizarAvisoLogin };
})();
