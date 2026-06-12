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
      $("#lista-pedidos-admin").html($("#lista-pedidos").html());
    } catch (err) {
      $("#lista-pedidos-admin").html('<p class="mensaje-vacio" role="alert">' + err.message + '</p>');
    }
  }

  function init() {
    $("#btn-nuevo-producto").on("click", function () {
      AdminView.llenarFormulario(null);
    });

    $("#form-admin-producto").on("submit", async function (e) {
      e.preventDefault();
      if (!AuthModel.isAdmin()) return;

      const datos = {
        nombre: $("#admin-nombre").val().trim(),
        categoria: $("#admin-categoria").val().trim(),
        precio: parseFloat($("#admin-precio").val()),
        stock: parseInt($("#admin-stock").val(), 10),
        descripcion: $("#admin-descripcion").val().trim(),
        imagen: $("#admin-imagen").val().trim() || undefined
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
        await CatalogoController.cargar();
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
        await CatalogoController.cargar();
      } catch (err) {
        AdminView.mostrarFeedback(err.message, true);
      }
    });
  }

  return { init, cargarProductos };
})();
