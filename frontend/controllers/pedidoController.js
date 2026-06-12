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

    try {
      const pedido = await PedidoModel.crear(CarritoModel.toPedidoItems());
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

  function init() {
    actualizarAvisoLogin();
    $("#btn-confirmar-pedido").on("click", confirmarPedido);

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
