const AdminController = (function () {
  "use strict";

  let productos = [];

  async function cargarProductos() {
    if (!AuthModel.isAdmin()) {
      window.location.href = "inicio.html";
      return;
    }

    try {
      productos = await ProductoModel.listar();
      AdminView.renderTabla(productos);
    } catch (err) {
      AdminView.mostrarFeedback(err.message, true);
    }
  }

  async function cargarPedidosAdmin() {
    if (!AuthModel.isAdmin()) return;

    try {
      const pedidos = await PedidoModel.todos();
      PedidosView.renderLista(pedidos, true);
    } catch (err) {
      $("#lista-pedidos").html('<p class="mensaje-vacio" role="alert">' + err.message + '</p>');
    }
  }

  async function cargarReportes(periodo) {
    try {
      var res = await PedidoModel.reportes(periodo);
      PedidosView.renderReportes(res);
    } catch (err) {
      $("#reportes-body").html('<p class="mensaje-vacio" role="alert">' + err.message + "</p>");
    }
  }

  function seleccionarTab(tab) {
    $(".admin-tab").removeClass("activo");
    $('.admin-tab[data-tab="' + tab + '"]').addClass("activo");
    $(".admin-tab-content").removeClass("activo");
    $("#tab-" + tab).addClass("activo");

    if (tab === "pedidos") {
      cargarPedidosAdmin();
    } else if (tab === "reportes") {
      cargarReportes("anual");
    }
  }

  function init() {
    $(".admin-tab").on("click", function () {
      seleccionarTab($(this).data("tab"));
    });

    $("#btn-nuevo-producto").on("click", function () {
      AdminView.llenarFormulario(null);
    });

    $("#form-admin-producto").on("submit", async function (e) {
      e.preventDefault();
      if (!AuthModel.isAdmin()) return;

      const nombre = $("#admin-nombre").val().trim();
      const categoria = $("#admin-categoria").val().trim();
      const precio = parseFloat($("#admin-precio").val());
      const stock = parseInt($("#admin-stock").val(), 10);
      const descripcion = $("#admin-descripcion").val().trim();
      const imagen = $("#admin-imagen").val().trim() || undefined;

      var peligro = Sanitize.validar(nombre) || Sanitize.validar(categoria) || Sanitize.validar(descripcion) || (imagen ? Sanitize.validar(imagen) : null);
      if (peligro) {
        AdminView.mostrarFeedback(peligro, true);
        return;
      }

      const datos = {
        nombre: nombre,
        categoria: categoria,
        precio: precio,
        stock: stock,
        descripcion: descripcion,
        imagen: imagen
      };

      const id = $("#admin-producto-id").val();

      try {
        if (id) {
          await ProductoModel.actualizar(parseInt(id, 10), datos);
          AdminView.mostrarFeedback("Producto actualizado.", false);
        } else {
          await ProductoModel.crear(datos);
          AdminView.mostrarFeedback("Producto creado.", false);
        }
        await cargarProductos();
        AdminView.llenarFormulario(null);
      } catch (err) {
        AdminView.mostrarFeedback(err.message, true);
      }
    });

    $(document).on("click", ".btn-editar-producto", async function () {
      const id = parseInt($(this).data("id"), 10);
      try {
        const producto = await ProductoModel.obtener(id);
        AdminView.llenarFormulario(producto);
      } catch (err) {
        AdminView.mostrarFeedback(err.message, true);
      }
    });

    $(document).on("click", ".btn-eliminar-producto", async function () {
      const id = parseInt($(this).data("id"), 10);
      if (!confirm("¿Eliminar este producto?")) return;

      try {
        await ProductoModel.eliminar(id);
        AdminView.mostrarFeedback("Producto eliminado.", false);
        await cargarProductos();
      } catch (err) {
        AdminView.mostrarFeedback(err.message, true);
      }
    });

    $(document).on("click", ".btn-aprobar-pedido", async function () {
      var id = parseInt($(this).data("id"), 10);
      try {
        await PedidoModel.aprobar(id, "aprobado");
        UiView.mostrarAlerta("Pedido #" + id + " aprobado.", "ok");
        await cargarPedidosAdmin();
      } catch (err) {
        UiView.mostrarAlerta(err.message, "error");
      }
    });

    $(document).on("click", ".btn-rechazar-pedido", async function () {
      var id = parseInt($(this).data("id"), 10);
      try {
        await PedidoModel.aprobar(id, "rechazado");
        UiView.mostrarAlerta("Pedido #" + id + " rechazado.", "error");
        await cargarPedidosAdmin();
      } catch (err) {
        UiView.mostrarAlerta(err.message, "error");
      }
    });

    $(document).on("click", ".btn-anular-pedido", async function () {
      var id = parseInt($(this).data("id"), 10);
      if (!confirm("¿Anular el pedido #" + id + "? Se restaurará el stock.")) return;
      try {
        await PedidoModel.anular(id);
        UiView.mostrarAlerta("Pedido #" + id + " anulado. Stock restaurado.", "error");
        await cargarPedidosAdmin();
      } catch (err) {
        UiView.mostrarAlerta(err.message, "error");
      }
    });

    $(document).on("click", ".btn-reporte", function () {
      var periodo = $(this).data("periodo");
      cargarReportes(periodo);
    });
  }

  return { init, cargarProductos };
})();
