const PedidoModel = (function () {
  "use strict";

  async function crear(items, metodoPagoId) {
    const body = { items: items };
    if (metodoPagoId) body.metodoPagoId = metodoPagoId;
    const response = await ApiModel.post("/pedidos", body);
    return response.data;
  }

  async function misPedidos() {
    const response = await ApiModel.get("/pedidos/mis-pedidos");
    return response.data || [];
  }

  async function todos() {
    const response = await ApiModel.get("/pedidos");
    return response.data || [];
  }

  async function aprobar(id, estado) {
    const response = await ApiModel.put("/pedidos/" + id + "/estado", { estado });
    return response;
  }

  async function reportes(periodo) {
    const response = await ApiModel.get("/pedidos/reportes?periodo=" + periodo);
    return response.data;
  }

  async function anular(id) {
    const response = await ApiModel.post("/pedidos/" + id + "/anular");
    return response;
  }

  return { crear, misPedidos, todos, aprobar, anular, reportes };
})();
