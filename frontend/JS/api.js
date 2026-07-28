// ============================================
// API CLIENT — connects this frontend to the Doon Hospital backend
// Include this file BEFORE JS/script.js on every page.
// ============================================
(function (window) {
  'use strict';

  // Change this if your backend runs somewhere else (e.g. a deployed URL).
  const API_BASE = window.API_BASE_URL || 'http://localhost:5000/api';

  const TOKEN_KEY = 'doonhospital_token';
  const USER_KEY = 'doonhospital_user';

  // ---------- Session helpers ----------
  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() {
    return !!getToken();
  }

  // Redirects to login.html if there's no active session. Call at the top
  // of any page that should be protected (e.g. dashboard.html).
  function requireAuthOrRedirect() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // ---------- Core fetch wrapper ----------
  // Returns the parsed JSON body on success.
  // Throws an Error with a human-readable message on failure.
  async function apiFetch(path, options) {
    options = options || {};
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );

    const token = getToken();
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    let response;
    try {
      response = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    } catch (networkErr) {
      throw new Error(
        'Could not reach the server. Make sure the backend is running at ' + API_BASE
      );
    }

    // 204 No Content
    if (response.status === 204) return null;

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // Non-JSON response body — leave data as null
    }

    if (!response.ok) {
      const message = (data && data.error) || 'Something went wrong (HTTP ' + response.status + ').';
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    return data;
  }

  // ---------- Nav bar auth state ----------
  // On pages that still show the default "Login / Register" buttons,
  // swap them for "Dashboard / Logout" when a session exists.
  // (dashboard.html already renders its own logged-in nav, so this
  // leaves it untouched.)
  function updateAuthNav() {
    const container = document.querySelector('.login-button');
    if (!container) return;

    // Already showing a logged-in nav (e.g. dashboard.html) — leave it alone.
    if (container.querySelector('.logout-btn')) return;

    if (!isLoggedIn()) return;

    const user = getUser();
    const firstName = user && user.name ? user.name.split(' ')[0] : 'there';
    const isAdmin = user && user.role === 'admin';
    const homeLink = isAdmin ? 'admin.html' : 'dashboard.html';
    const homeLabel = isAdmin ? 'Admin Panel' : 'Dashboard';

    container.innerHTML =
      '<span class="user-greeting" style="margin-right:0.75rem;"><i class="fa-solid fa-user"></i> Hi, ' +
      firstName +
      '</span>' +
      '<a href="' + homeLink + '"><button class="user">' + homeLabel + '</button></a>' +
      '<button class="user login logout-btn" onclick="logout()">Logout</button>';
  }

  // Global logout — referenced directly from HTML (onclick="logout()")
  // on dashboard.html and from the nav injected by updateAuthNav().
  window.logout = function () {
    clearSession();
    window.location.href = 'index.html';
  };

  window.HospitalAPI = {
    apiFetch,
    saveSession,
    getToken,
    getUser,
    clearSession,
    isLoggedIn,
    requireAuthOrRedirect,
    updateAuthNav,
  };
})(window);
