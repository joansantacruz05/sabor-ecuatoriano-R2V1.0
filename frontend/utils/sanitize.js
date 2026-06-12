var Sanitize = (function () {
  "use strict";

  var PATRONES_PELIGROSOS = [
    { regex: /<script[\s>]/i, msg: "No se permiten etiquetas script" },
    { regex: /javascript\s*:/i, msg: "No se permiten enlaces javascript" },
    { regex: /on\w+\s*=\s*['"]?/i, msg: "No se permiten manejadores de eventos" },
    { regex: /--/, msg: "No se permiten comentarios SQL" },
    { regex: /\/\*/, msg: "No se permiten comentarios SQL" },
    { regex: /select\s+.*\s+from/i, msg: "No se permiten sentencias SQL" },
    { regex: /insert\s+into/i, msg: "No se permiten sentencias SQL" },
    { regex: /update\s+.*\s+set/i, msg: "No se permiten sentencias SQL" },
    { regex: /delete\s+from/i, msg: "No se permiten sentencias SQL" },
    { regex: /drop\s+table/i, msg: "No se permiten sentencias SQL" },
    { regex: /truncate\s+table/i, msg: "No se permiten sentencias SQL" },
    { regex: /alter\s+table/i, msg: "No se permiten sentencias SQL" },
    { regex: /create\s+table/i, msg: "No se permiten sentencias SQL" },
    { regex: /union\s+select/i, msg: "No se permiten sentencias SQL" },
    { regex: /or\s+\d+\s*=\s*\d+/i, msg: "No se permiten inyecciones SQL" },
    { regex: /exec\s*\(/i, msg: "No se permiten funciones ejecutoras" },
    { regex: /eval\s*\(/i, msg: "No se permiten eval" },
    { regex: /require\s*\(/i, msg: "No se permiten funciones del sistema" },
    { regex: /import\s*\(/i, msg: "No se permiten importaciones" },
    { regex: /fetch\s*\(/i, msg: "No se permiten peticiones embedidas" },
    { regex: /\\$/i, msg: "No se permiten caracteres de escape" },
    { regex: /`/, msg: "No se permiten backticks" },
    { regex: /\$\{/, msg: "No se permiten template literals" },
    { regex: /<\?/, msg: "No se permiten etiquetas PHP" },
    { regex: /system\s*\(/i, msg: "No se permiten comandos del sistema" },
    { regex: /sp_execute/i, msg: "No se permiten procedimientos SQL" },
    { regex: /xp_cmdshell/i, msg: "No se permiten comandos shell" },
    { regex: /char\s*\(/i, msg: "No se permiten funciones SQL" },
    { regex: /nchar\s*\(/i, msg: "No se permiten funciones SQL" },
    { regex: /waitfor\s+delay/i, msg: "No se permiten retardos SQL" },
    { regex: /0x[0-9a-f]{4,}/i, msg: "No se permiten codificacion hexadecimal" },
  ];

  function validar(valor) {
    if (!valor || typeof valor !== "string") return null;
    for (var i = 0; i < PATRONES_PELIGROSOS.length; i++) {
      if (PATRONES_PELIGROSOS[i].regex.test(valor)) {
        return PATRONES_PELIGROSOS[i].msg;
      }
    }
    return null;
  }

  function limpiar(valor) {
    if (!valor || typeof valor !== "string") return valor;
    return valor.replace(/[<>]/g, "").replace(/['";`\\]/g, "");
  }

  function mostrarError($input, error) {
    var $fb = $input.siblings(".feedback-inline").first();
    if ($fb.length === 0) {
      $fb = $input.closest(".campo").find(".feedback-inline").first();
    }
    if ($fb.length) {
      $fb.text(error).addClass("error");
    }
  }

  function limpiarError($input) {
    var $fb = $input.siblings(".feedback-inline").first();
    if ($fb.length === 0) {
      $fb = $input.closest(".campo").find(".feedback-inline").first();
    }
    if ($fb.length) {
      $fb.text("").removeClass("error");
    }
  }

  function aplicarGlobal() {
    $("input[type='text'], input[type='tel'], input[type='email'], input[type='url'], input[type='password'], input:not([type]), textarea").on("input", function () {
      var $input = $(this);
      var val = $input.val();
      var error = validar(val);
      if (error) {
        $input.val(limpiar(val));
        mostrarError($input, error);
      } else {
        limpiarError($input);
      }
    });

    $("input[type='number']").on("input", function () {
      var $input = $(this);
      var val = $input.val();
      if (val && val.length > 0) {
        var stripped = val.replace(/[^0-9.-]/g, "");
        if (stripped !== val) {
          $input.val(stripped);
          mostrarError($input, "No se permiten caracteres no num\u00e9ricos");
        } else {
          var error = validar(val);
          if (error) {
            mostrarError($input, error);
          } else {
            limpiarError($input);
          }
        }
      }
    });

    $("form").on("submit", function (e) {
      var hasError = false;
      $(this).find("input, textarea").each(function () {
        var val = $(this).val();
        if (val && typeof val === "string") {
          var error = validar(val);
          if (error) {
            hasError = true;
            mostrarError($(this), error);
          }
        }
      });
      if (hasError) {
        e.preventDefault();
        return false;
      }
    });
  }

  return { validar: validar, limpiar: limpiar, aplicarGlobal: aplicarGlobal };
})();
