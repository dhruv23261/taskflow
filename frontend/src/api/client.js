// ─────────────────────────────────────────────
// src/api/client.js — Axios API Client
//
// Central axios instance used by all API calls.
// - Sets base URL from env
// - Attaches JWT token to every request
// - Handles 401 → redirect to login
// ─────────────────────────────────────────────

import axios from 'axios';

// Vite exposes env vars via import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────
// Attach JWT token from localStorage to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────
// If server returns 401, the token expired → clear storage and redirect
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and redirect to login
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      // Navigate to login — using window.location since we're outside React
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
