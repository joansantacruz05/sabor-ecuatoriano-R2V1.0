const AuthController = (function () {
  "use strict";

  function init() {
    $(document).on("click", "#btn-logout", function () {
      AuthModel.logout();
      UiView.actualizarNavUsuario(null);
      if (typeof PedidoController !== "undefined") {
        PedidoController.actualizarAvisoLogin();
      }
      UiView.mostrarAlerta("Sesión cerrada correctamente.", "info");
      window.location.href = "inicio.html";
    });

    $("#btn-mostrar-register").on("click", function () {
      AuthView.cambiarModoAuth("register");
    });

    $("#btn-mostrar-login").on("click", function () {
      AuthView.cambiarModoAuth("login");
    });

    $("#btn-mostrar-forgot").on("click", function () {
      AuthView.cambiarModoAuth("forgot");
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

    $("#form-forgot").on("submit", async function (e) {
      e.preventDefault();
      AuthView.limpiarErrores();

      const email = $("#forgot-email").val().trim();

      try {
        const data = await AuthModel.forgotPassword(email);
        if (data.resetToken) {
          AuthView.mostrarExitoForgot("Token generado. Ahora restablece tu contraseña.");
          $("#form-forgot").attr("hidden", true);
          $("#form-reset").removeAttr("hidden");
          $("#reset-token").val(data.resetToken);
        } else {
          AuthView.mostrarExitoForgot(data.message);
        }
      } catch (err) {
        AuthView.mostrarErrorForgot(err.message || "Error al solicitar recuperación");
      }
    });

    $("#form-reset").on("submit", async function (e) {
      e.preventDefault();
      AuthView.limpiarErrores();

      const token = $("#reset-token").val().trim();
      const password = $("#reset-password").val();

      if (!token || password.length < 8) {
        AuthView.mostrarErrorReset("Token inválido o contraseña muy corta.");
        return;
      }

      try {
        await AuthModel.resetPassword(token, password);
        UiView.mostrarAlerta("Contraseña actualizada. Inicia sesión.", "ok");
        AuthView.cambiarModoAuth("login");
      } catch (err) {
        AuthView.mostrarErrorReset(err.message || "Error al restablecer la contraseña");
      }
    });
  }

  return { init };
})();
