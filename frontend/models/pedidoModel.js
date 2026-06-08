const PedidoModel = (function () {
  "use strict";

  async function crear(items) {
    const response = await ApiModel.post("/pedidos", { items });
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

  return { crear, misPedidos, todos };
})();
