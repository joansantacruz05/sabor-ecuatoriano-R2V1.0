const ProductoModel = (function () {
  "use strict";

  let cache = [];

  async function listar() {
    const response = await ApiModel.get("/productos");
    cache = response.data || [];
    return cache;
  }

  async function obtener(id) {
    const response = await ApiModel.get("/productos/" + id);
    return response.data;
  }

  async function crear(datos) {
    const response = await ApiModel.post("/productos", datos);
    return response.data;
  }

  async function actualizar(id, datos) {
    const response = await ApiModel.put("/productos/" + id, datos);
    return response.data;
  }

  async function eliminar(id) {
    return ApiModel.del("/productos/" + id);
  }

  function getCache() {
    return cache;
  }

  return { listar, obtener, crear, actualizar, eliminar, getCache };
})();
