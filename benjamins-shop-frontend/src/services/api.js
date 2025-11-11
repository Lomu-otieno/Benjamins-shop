// src/services/api.js - PRODUCTION READY
import axios from "axios";

// ✅ DYNAMIC API BASE URL
const getApiBase = () => {
  // In production, use direct backend URL
  if (import.meta.env.PROD) {
    return "https://benjamins-shop.onrender.com/api";
  }
  // In development, use environment variable
  return import.meta.env.VITE_SERVER_URI;
};

const API_BASE = getApiBase();

console.log("🚀 API Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Request interceptor remains the same
api.interceptors.request.use((config) => {
  const requiresGuestSession =
    config.url?.includes("/cart") ||
    config.url?.includes("/orders") ||
    config.url?.includes("/guest/session");

  if (requiresGuestSession) {
    const sessionId = localStorage.getItem("guestSessionId");
    if (sessionId) {
      config.headers["X-Guest-Session-Id"] = sessionId;
      console.log("🔑 Adding guest session header to:", config.url, sessionId);
    }
  }
  return config;
});

// Response interceptor remains the same
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Export APIs (same as before)
export const productsAPI = {
  getAll: (filters = {}) => api.get("/products", { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
};

export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) =>
    api.post("/cart", { productId, quantity }),
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete("/cart"),
};

export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getByOrderNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  getBySession: (sessionId) => api.get(`/orders/guest/${sessionId}`),
};

export const guestAPI = {
  getSession: () => api.get("/guest/session"),
};

export default api;
