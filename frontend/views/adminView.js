const AdminView = (function () {
  "use strict";

  async function cargarCategorias() {
    const $sel = $("#admin-categoria");
    try {
      const res = await ApiModel.get("/categorias");
      const categorias = res.data || [];
      $sel.find("option:not([value=''])").remove();
      categorias.forEach(function (c) {
        $sel.append('<option value="' + c.nombre + '">' + c.nombre + '</option>');
      });
    } catch (e) {
      console.warn("No se pudieron cargar categorías", e);
    }
  }

  function renderTabla(productos) {
    const $tbody = $("#admin-productos-body");
    $tbody.empty();

    if (!productos.length) {
      $tbody.html('<tr><td colspan="6" class="mensaje-vacio">Sin productos</td></tr>');
      return;
    }

    productos.forEach(function (p) {
      $tbody.append(
        '<tr>' +
          '<td>' + p.id + '</td>' +
          '<td>' + p.nombre + '</td>' +
          '<td>' + (p.categoria || "—") + '</td>' +
          '<td>$' + p.precio.toFixed(2) + '</td>' +
          '<td>' + p.stock + '</td>' +
          '<td class="admin-acciones">' +
            '<button type="button" class="btn btn-secundario btn-sm btn-editar-producto" data-id="' + p.id + '">Editar</button> ' +
            '<button type="button" class="btn btn-peligro btn-sm btn-eliminar-producto" data-id="' + p.id + '">Eliminar</button>' +
          '</td>' +
        '</tr>'
      );
    });
  }

  function llenarFormulario(producto) {
    $("#admin-producto-id").val(producto ? producto.id : "");
    $("#admin-nombre").val(producto ? producto.nombre : "");
    $("#admin-categoria").val(producto ? (producto.categoria || "") : "");
    $("#admin-precio").val(producto ? producto.precio : "");
    $("#admin-stock").val(producto ? producto.stock : "");
    $("#admin-descripcion").val(producto ? (producto.descripcion || "") : "");
    $("#admin-imagen").val(producto ? (producto.imagen || "") : "");
    $("#admin-form-titulo").text(producto ? "Editar producto" : "Nuevo producto");
  }

  function mostrarFeedback(msg, esError) {
    const $fb = $("#admin-feedback");
    $fb.removeClass("ok error").addClass(esError ? "error" : "ok").text(msg).attr("role", "alert");
  }

  return { cargarCategorias, renderTabla, llenarFormulario, mostrarFeedback };
})();
