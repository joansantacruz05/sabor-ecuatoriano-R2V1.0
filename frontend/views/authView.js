const AuthView = (function () {
  "use strict";

  function mostrarErrorLogin(msg) {
    $("#error-login").text(msg).attr("aria-live", "assertive");
  }

  function mostrarErrorRegister(msg) {
    $("#error-register").text(msg).attr("aria-live", "assertive");
  }

  function limpiarErrores() {
    $("#error-login, #error-register").text("");
  }

  function cambiarModoAuth(modo) {
    if (modo === "register") {
      $("#form-login").attr("hidden", true);
      $("#form-register").removeAttr("hidden");
      $("#auth-titulo").text("Crear cuenta");
    } else {
      $("#form-register").attr("hidden", true);
      $("#form-login").removeAttr("hidden");
      $("#auth-titulo").text("Iniciar sesión");
    }
    limpiarErrores();
  }

  return { mostrarErrorLogin, mostrarErrorRegister, limpiarErrores, cambiarModoAuth };
})();
