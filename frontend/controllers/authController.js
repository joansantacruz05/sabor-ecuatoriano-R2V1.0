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

      if (Sanitize.validar(email)) {
        AuthView.mostrarErrorLogin("Correo inv\u00e1lido");
        return;
      }

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
      const nombreCompleto = $("#register-nombre").val().trim() || undefined;
      const cedula = $("#register-cedula").val().trim() || undefined;
      const direccion = $("#register-direccion").val().trim() || undefined;
      const ciudad = $("#register-ciudad").val().trim() || undefined;
      const telefono = $("#register-telefono").val().trim() || undefined;

      var peligro = Sanitize.validar(username) || Sanitize.validar(email) || Sanitize.validar(nombreCompleto) || Sanitize.validar(cedula) || Sanitize.validar(direccion) || Sanitize.validar(ciudad) || Sanitize.validar(telefono);
      if (peligro) {
        AuthView.mostrarErrorRegister(peligro);
        return;
      }

      try {
        const user = await AuthModel.register(username, email, password, nombreCompleto, cedula, direccion, ciudad, telefono);
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

      if (Sanitize.validar(email)) {
        AuthView.mostrarErrorForgot("Correo inv\u00e1lido");
        return;
      }

      try {
        await AuthModel.forgotPassword(email);
        AuthView.mostrarExitoForgot("Si el correo existe, recibirás un enlace de recuperación.");
        $("#form-forgot").attr("hidden", true);
        $("#reset-email").val(email);
        $("#form-reset").removeAttr("hidden");
      } catch (err) {
        AuthView.mostrarErrorForgot(err.message || "Error al solicitar recuperación");
      }
    });

    $("#form-reset").on("submit", async function (e) {
      e.preventDefault();
      AuthView.limpiarErrores();

      const email = $("#reset-email").val().trim();
      const password = $("#reset-password").val();
      const confirm = $("#reset-confirm").val();

      if (Sanitize.validar(email)) {
        AuthView.mostrarErrorReset("Correo inv\u00e1lido");
        return;
      }

      if (!email || password.length < 8) {
        AuthView.mostrarErrorReset("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (password !== confirm) {
        AuthView.mostrarErrorReset("Las contraseñas no coinciden.");
        return;
      }

      try {
        await AuthModel.resetPassword(email, password);
        UiView.mostrarAlerta("Contraseña actualizada. Inicia sesión.", "ok");
        AuthView.cambiarModoAuth("login");
      } catch (err) {
        AuthView.mostrarErrorReset(err.message || "Error al restablecer la contraseña");
      }
    });
  }

  return { init };
})();
