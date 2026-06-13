const PedidosView = (function () {
  "use strict";

  var estadosColores = {
    pendiente: "badge-aml",
    aprobado: "badge-ok",
    rechazado: "badge-error",
    anulado: "badge-error",
    entregado: "badge-ok"
  };

  function badgeEstado(estado) {
    var cls = estadosColores[estado] || "badge-aml";
    return '<span class="pedido-estado ' + cls + '">' + (estado || "pendiente").toUpperCase() + "</span>";
  }

  function renderLista(pedidos, esAdmin) {
    var $lista = $("#lista-pedidos");
    $lista.empty();

    if (!pedidos.length) {
      $lista.html('<p class="mensaje-vacio">No hay pedidos registrados.</p>');
      return;
    }

    pedidos.forEach(function (pedido) {
      var fecha = new Date(pedido.createdAt).toLocaleString("es-EC");
      var detallesHtml = "";
      (pedido.detalles || []).forEach(function (d) {
        var img = d.producto && d.producto.imagenes && d.producto.imagenes.length
          ? d.producto.imagenes[0].url : "";
        var imgHtml = img
          ? '<img src="' + img + '" alt="" class="pedido-item-img" loading="lazy" />'
          : "";
        detallesHtml +=
          '<li class="pedido-item">' +
          imgHtml +
          '<span>' + d.cantidad + 'x ' + (d.producto ? d.producto.nombre : "Producto") +
          ' -- $' + (d.precioUnitario * d.cantidad).toFixed(2) + "</span></li>";
      });

      var usuarioHtml = "";
      if (esAdmin && pedido.usuario) {
        usuarioHtml =
          '<div class="pedido-cliente">' +
          "<p><strong>Cliente:</strong> " + pedido.usuario.username + " (" + pedido.usuario.email + ")</p>" +
          (pedido.usuario.cedula ? "<p><strong>C\u00e9dula:</strong> " + pedido.usuario.cedula + "</p>" : "") +
          (pedido.usuario.nombreCompleto ? "<p><strong>Nombre:</strong> " + pedido.usuario.nombreCompleto + "</p>" : "") +
          (pedido.usuario.direccion ? "<p><strong>Direccion:</strong> " + pedido.usuario.direccion + "</p>" : "") +
          (pedido.usuario.ciudad ? "<p><strong>Ciudad:</strong> " + pedido.usuario.ciudad + "</p>" : "") +
          (pedido.usuario.telefono ? "<p><strong>Telefono:</strong> " + pedido.usuario.telefono + "</p>" : "") +
          "</div>";
      }

      var accionesHtml = "";
      if (esAdmin && pedido.estado === "pendiente") {
        accionesHtml =
          '<div class="pedido-acciones">' +
          '<button type="button" class="btn btn-sm btn-primario btn-aprobar-pedido" data-id="' + pedido.id + '">Aprobar</button> ' +
          '<button type="button" class="btn btn-sm btn-peligro btn-rechazar-pedido" data-id="' + pedido.id + '">Rechazar</button>' +
          "</div>";
      }
      if (esAdmin && pedido.estado !== "anulado") {
        accionesHtml +=
          ' <button type="button" class="btn btn-sm btn-peligro btn-anular-pedido" data-id="' + pedido.id + '">Anular</button>';
      }

      var facturaHtml = "";
      if (pedido.factura) {
        var f = pedido.factura;
        var metodoPagoNombre = f.metodoPago && f.metodoPago.nombre ? f.metodoPago.nombre : "-";
        facturaHtml =
          '<div class="pedido-factura">' +
          "<p><strong>Factura:</strong> " + f.numeroFactura +
          " | RUC: " + f.ruc +
          " | Metodo: " + metodoPagoNombre + "</p>" +
          "<p><strong>Subtotal:</strong> $" + f.subtotal.toFixed(2) +
          " | <strong>Descuento:</strong> $" + f.descuento.toFixed(2) +
          " | <strong>IVA (15%):</strong> $" + f.iva.toFixed(2) +
          " | <strong>Total:</strong> $" + f.total.toFixed(2) + "</p>" +
          "<p><strong>Estado:</strong> " + f.estado +
          " | <strong>Vence:</strong> " + (f.fechaVencimiento ? new Date(f.fechaVencimiento).toLocaleDateString("es-EC") : "-") + "</p>" +
          '<a href="#" class="btn btn-sm btn-secundario btn-descargar-factura" data-pedido-id="' + pedido.id + '">Descargar PDF</a>' +
          "</div>";
      }

      $lista.append(
        '<article class="pedido-card">' +
          '<header class="pedido-card-header">' +
            "<h3>Pedido #" + String(pedido.id).padStart(4, "0") + "</h3>" +
            badgeEstado(pedido.estado) +
            '<time datetime="' + pedido.createdAt + '">' + fecha + "</time>" +
          "</header>" +
          usuarioHtml +
          '<ul class="pedido-detalles">' + detallesHtml + "</ul>" +
          '<p class="pedido-total"><strong>Total:</strong> $' + pedido.total.toFixed(2) + "</p>" +
          facturaHtml +
          accionesHtml +
        "</article>"
      );
    });
  }

  function mostrarExito(numeroPedido) {
    $("#exito-numero").text("#" + String(numeroPedido).padStart(4, "0"));
    UiView.abrirModal("modal-exito");
  }

  function renderReportes(data) {
    var $cont = $("#reportes-body");
    $cont.empty();
    if (!data) {
      $cont.html('<p class="mensaje-vacio">Selecciona un periodo para ver los reportes.</p>');
      return;
    }

    var maxTop = 1;
    if (data.topProductos && data.topProductos.length) {
      data.topProductos.forEach(function (tp) { if (tp.cantidad > maxTop) maxTop = tp.cantidad; });
    }

    var topHtml = "";
    if (data.topProductos && data.topProductos.length) {
      topHtml = '<div class="dashboard-seccion"><h3 class="dashboard-titulo-section">Top 5 productos</h3>';
      data.topProductos.forEach(function (tp) {
        var pct = Math.round((tp.cantidad / maxTop) * 100);
        topHtml +=
          '<div class="barra-item"><span class="barra-label">' + tp.producto + '</span>' +
          '<div class="barra-track"><div class="barra-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="barra-cantidad">' + tp.cantidad + '</span></div>';
      });
      topHtml += "</div>";
    }

    var ventasDiaHtml = "";
    if (data.ventasPorDia) {
      var dias = Object.keys(data.ventasPorDia).sort();
      if (dias.length) {
        var maxVenta = 1;
        dias.forEach(function (d) { if (data.ventasPorDia[d] > maxVenta) maxVenta = data.ventasPorDia[d]; });
        ventasDiaHtml = '<div class="dashboard-seccion"><h3 class="dashboard-titulo-section">Ventas por dia</h3>';
        dias.forEach(function (d) {
          var pct2 = data.ventasPorDia[d] / maxVenta * 100;
          ventasDiaHtml +=
            '<div class="barra-item"><span class="barra-label">' + d + '</span>' +
            '<div class="barra-track"><div class="barra-fill barra-fill-venta" style="width:' + pct2 + '%"></div></div>' +
            '<span class="barra-cantidad">$' + data.ventasPorDia[d].toFixed(2) + '</span></div>';
        });
        ventasDiaHtml += "</div>";
      }
    }

    var periodoLabel = data.periodo.charAt(0).toUpperCase() + data.periodo.slice(1);

    var cifrasHtml =
      '<div class="dcifra dcifra-ventas"><div class="dcifra-icono">$</div><div class="dcifra-cuerpo"><span class="dcifra-valor">' + data.totalVentas.toFixed(2) + '</span><span class="dcifra-label">Ventas totales</span></div></div>' +
      '<div class="dcifra dcifra-aprobados"><div class="dcifra-icono">V</div><div class="dcifra-cuerpo"><span class="dcifra-valor">' + data.cantidadPedidos + '</span><span class="dcifra-label">Aprobados</span></div></div>' +
      '<div class="dcifra dcifra-pendientes"><div class="dcifra-icono">P</div><div class="dcifra-cuerpo"><span class="dcifra-valor">' + data.cantidadPendientes + '</span><span class="dcifra-label">Pendientes</span></div></div>' +
      '<div class="dcifra dcifra-anulados"><div class="dcifra-icono">X</div><div class="dcifra-cuerpo"><span class="dcifra-valor">$' + data.totalAnulados.toFixed(2) + '</span><span class="dcifra-label">Anulados</span></div></div>';

    $cont.append(
      '<div class="dashboard-header">' +
      "<h3>Dashboard " + periodoLabel + "</h3>" +
      '<span class="dashboard-fechas">' + data.fechaInicio + " -> " + data.fechaFin + "</span>" +
      "</div>" +
      '<div class="dashboard-cifras">' + cifrasHtml + "</div>" +
      '<div class="dashboard-grid">' + topHtml + ventasDiaHtml + "</div>"
    );
  }

  return { renderLista: renderLista, mostrarExito: mostrarExito, renderReportes: renderReportes };
})();
