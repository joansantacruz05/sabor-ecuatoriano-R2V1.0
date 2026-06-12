const AuthController = (function () {
  "use strict";

  function init() {
    $(document).on("click", "#btn-logout", function () {
      AuthModel.logout();
      UiView.actualizarNavUsuario(null);
      PedidoController.actualizarAvisoLogin();
      UiView.mostrarAlerta("Sesión cerrada correctamente.", "info");
      window.location.href = "inicio.html";
    });

    $("#btn-mostrar-register").on("click", function () {
      AuthView.cambiarModoAuth("register");
    });

    $("#btn-mostrar-login").on("click", function () {
      AuthView.cambiarModoAuth("login");
    });

    $("#form-login").on("submit", async function (e) {
      e.preventDefault();
      AuthView.limpiarErrores();

      const email = $("#login-email").val().trim();
      const password = $("#login-password").val();

      try {
        const user = await AuthModel.login(email, password);
        UiView.actualizarNavUsuario(user);
        if (typeof PedidoController !== "undefined") {
          PedidoController.actualizarAvisoLogin();
        }
        UiView.mostrarAlerta("Bienvenido, " + user.username + ".", "ok");
        window.location.href = "menu.html";
      } catch (err) {
        AuthView.mostrarErrorLogin(err.message || "Error al iniciar sesión");
      }
    });

    $("#form-register").on("submit", async function (e) {
      e.preventDefault();
      AuthView.limpiarErrores();

      const username = $("#register-username").val().trim();
      const email = $("#register-email").val().trim();
      const password = $("#register-password").val();

      try {
        const user = await AuthModel.register(username, email, password);
        UiView.actualizarNavUsuario(user);
        if (typeof PedidoController !== "undefined") {
          PedidoController.actualizarAvisoLogin();
        }
        UiView.mostrarAlerta("Cuenta creada exitosamente.", "ok");
        window.location.href = "menu.html";
      } catch (err) {
        AuthView.mostrarErrorRegister(err.message || "Error al registrarse");
      }
    });
  }

  return { init };
})();
