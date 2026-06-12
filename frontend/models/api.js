const ApiModel = (function () {
  "use strict";

  const API_BASE = "/api";

  async function request(endpoint, options) {
    const config = Object.assign(
      { headers: { "Content-Type": "application/json" } },
      options || {}
    );

    const token = localStorage.getItem("saborec_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }

    let response;
    try {
      response = await fetch(API_BASE + endpoint, config);
    } catch (err) {
      const error = new Error("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
      error.status = 0;
      throw error;
    }

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const error = new Error((data && data.message) || "Error en la solicitud");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  return {
    get: (endpoint) => request(endpoint, { method: "GET" }),
    post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    del: (endpoint) => request(endpoint, { method: "DELETE" })
  };
})();
