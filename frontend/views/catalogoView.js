const CatalogoView = (function () {
  "use strict";

  let categoriaActiva = "Todos";

  function renderTarjeta(producto) {
    const inicial = producto.nombre.charAt(0);
    const sinStock = producto.stock <= 0;

    return (
      '<article class="tarjeta-plato" data-id="' + producto.id + '">' +
        '<div class="tarjeta-imagen">' +
          '<img src="' + (producto.imagen || "") + '" alt="' + producto.nombre + '" ' +
          'onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div class=tarjeta-imagen-fallback>' + inicial + '</div>\';" />' +
        '</div>' +
        '<div class="tarjeta-cuerpo">' +
          '<span class="tarjeta-categoria">' + (producto.categoria || "") + '</span>' +
          '<h3>' + producto.nombre + '</h3>' +
          '<p class="tarjeta-descripcion">' + (producto.descripcion || "") + '</p>' +
          '<p class="tarjeta-stock">Stock: ' + producto.stock + '</p>' +
          '<div class="tarjeta-footer">' +
            '<span class="tarjeta-precio">$' + producto.precio.toFixed(2) + '</span>' +
            '<button type="button" class="btn-anadir" data-id="' + producto.id + '" ' +
              (sinStock ? 'disabled aria-disabled="true"' : "") + '>' +
              (sinStock ? "Agotado" : "Añadir") +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function render(productos) {
    const $grid = $("#grid-platos");
    $grid.attr("aria-busy", "true").empty();

    const filtrados = categoriaActiva === "Todos"
      ? productos
      : productos.filter(function (p) { return p.categoria === categoriaActiva; });

    if (filtrados.length === 0) {
      $grid.append('<p class="mensaje-vacio">No hay platos en esta categoría.</p>');
    } else {
      filtrados.forEach(function (p) {
        $grid.append(renderTarjeta(p));
      });
    }

    $grid.attr("aria-busy", "false");
  }

  function cambiarCategoria(cat) {
    categoriaActiva = cat;
    $(".btn-filtro").removeClass("activo").attr("aria-selected", "false");
    $(".btn-filtro[data-categoria='" + cat + "']").addClass("activo").attr("aria-selected", "true");
  }

  function mostrarCargando() {
    $("#grid-platos").html('<p class="mensaje-vacio" aria-live="polite">Cargando menú...</p>');
  }

  function mostrarError(mensaje) {
    $("#grid-platos").html('<p class="mensaje-vacio" role="alert">' + mensaje + '</p>');
  }

  return { render, cambiarCategoria, mostrarCargando, mostrarError };
})();
