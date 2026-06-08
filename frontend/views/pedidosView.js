const PedidosView = (function () {
  "use strict";

  function renderLista(pedidos, esAdmin) {
    const $lista = $("#lista-pedidos");
    $lista.empty();

    if (!pedidos.length) {
      $lista.html('<p class="mensaje-vacio">No hay pedidos registrados.</p>');
      return;
    }

    pedidos.forEach(function (pedido) {
      const fecha = new Date(pedido.createdAt).toLocaleString("es-EC");
      let detallesHtml = "";
      (pedido.detalles || []).forEach(function (d) {
        detallesHtml +=
          '<li>' + d.cantidad + '× ' + (d.producto ? d.producto.nombre : "Producto") +
          ' — $' + (d.precioUnitario * d.cantidad).toFixed(2) + '</li>';
      });

      const usuarioHtml = esAdmin && pedido.usuario
        ? '<p><strong>Cliente:</strong> ' + pedido.usuario.username + ' (' + pedido.usuario.email + ')</p>'
        : "";

      $lista.append(
        '<article class="pedido-card">' +
          '<header class="pedido-card-header">' +
            '<h3>Pedido #' + String(pedido.id).padStart(4, "0") + '</h3>' +
            '<time datetime="' + pedido.createdAt + '">' + fecha + '</time>' +
          '</header>' +
          usuarioHtml +
          '<ul class="pedido-detalles">' + detallesHtml + '</ul>' +
          '<p class="pedido-total"><strong>Total:</strong> $' + pedido.total.toFixed(2) + '</p>' +
        '</article>'
      );
    });
  }

  function mostrarExito(numeroPedido) {
    $("#exito-numero").text("#" + String(numeroPedido).padStart(4, "0"));
    UiView.abrirModal("modal-exito");
  }

  return { renderLista, mostrarExito };
})();
