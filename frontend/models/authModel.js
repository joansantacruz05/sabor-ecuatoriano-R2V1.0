const AuthModel = (function () {
  "use strict";

  const TOKEN_KEY = "saborec_token";
  const USER_KEY = "saborec_user";

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function isAdmin() {
    const user = getUser();
    return user && user.role === "admin";
  }

  async function login(email, password) {
    const data = await ApiModel.post("/auth/login", { email, password });
    saveSession(data.token, data.user);
    return data.user;
  }

  async function register(username, email, password, nombreCompleto, cedula, direccion, ciudad, telefono) {
    const body = { username, email, password };
    if (nombreCompleto) body.nombreCompleto = nombreCompleto;
    if (cedula) body.cedula = cedula;
    if (direccion) body.direccion = direccion;
    if (ciudad) body.ciudad = ciudad;
    if (telefono) body.telefono = telefono;
    const data = await ApiModel.post("/auth/register", body);
    saveSession(data.token, data.user);
    return data.user;
  }

  async function forgotPassword(email) {
    return ApiModel.post("/auth/forgot-password", { email });
  }

  async function resetPassword(email, password) {
    return ApiModel.post("/auth/reset-password", { email, password });
  }

  function logout() {
    clearSession();
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    getToken,
    getUser,
    isLoggedIn,
    isAdmin,
    saveSession,
    clearSession
  };
})();
