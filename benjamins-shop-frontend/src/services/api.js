// src/services/api.js - SECURE VERSION
import axios from "axios";

// ✅ SECURE: Environment variables are only available at build time
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ✅ VALIDATION: Check if environment variable is set
if (!API_BASE) {
  console.error("❌ VITE_API_BASE_URL is not set!");
  // In production, this will cause a build error (good!)
  throw new Error("API base URL is not configured");
}

console.log("🚀 API Base URL:", API_BASE ? "✅ Set" : "❌ Missing");

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ... rest of your interceptors and API methods remain the same
// (keep the request/response interceptors you already have)

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
