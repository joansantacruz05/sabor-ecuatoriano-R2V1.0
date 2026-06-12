const AuthView = (function () {
  "use strict";

  function mostrarErrorLogin(msg) {
    $("#error-login").text(msg).attr("aria-live", "assertive");
  }

  function mostrarErrorRegister(msg) {
    $("#error-register").text(msg).attr("aria-live", "assertive");
  }

  function mostrarErrorForgot(msg) {
    $("#error-forgot").text(msg).attr("aria-live", "assertive");
  }

  function mostrarErrorReset(msg) {
    $("#error-reset").text(msg).attr("aria-live", "assertive");
  }

  function mostrarExitoForgot(msg) {
    $("#exito-forgot").text(msg).removeAttr("hidden");
  }

  function limpiarErrores() {
    $("#error-login, #error-register, #error-forgot, #error-reset, #exito-forgot").text("");
    $("#exito-forgot").attr("hidden", true);
  }

  function cambiarModoAuth(modo) {
    if (modo === "register") {
      $("#form-login, #form-forgot, #form-reset").attr("hidden", true);
      $("#form-register").removeAttr("hidden");
      $("#auth-titulo").text("Crear cuenta");
    } else if (modo === "forgot") {
      $("#form-login, #form-register, #form-reset").attr("hidden", true);
      $("#form-forgot").removeAttr("hidden");
      $("#auth-titulo").text("Recuperar contraseña");
    } else {
      $("#form-register, #form-forgot, #form-reset").attr("hidden", true);
      $("#form-login").removeAttr("hidden");
      $("#auth-titulo").text("Iniciar sesión");
    }
    limpiarErrores();
  }

  return { mostrarErrorLogin, mostrarErrorRegister, mostrarErrorForgot, mostrarErrorReset, mostrarExitoForgot, limpiarErrores, cambiarModoAuth };
})();
