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

  async function register(username, email, password) {
    const data = await ApiModel.post("/auth/register", { username, email, password });
    saveSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    clearSession();
  }

  return {
    login,
    register,
    logout,
    getToken,
    getUser,
    isLoggedIn,
    isAdmin,
    saveSession,
    clearSession
  };
})();
