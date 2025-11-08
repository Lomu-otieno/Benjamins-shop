// src/services/api.js - FIXED VERSION
import axios from "axios";

const API_BASE = "https://benjamins-shop.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ✅ FIXED: Use the correct header name that backend expects
api.interceptors.request.use((config) => {
  const requiresGuestSession =
    config.url?.includes("/cart") ||
    config.url?.includes("/orders") ||
    config.url?.includes("/guest/session");

  if (requiresGuestSession) {
    const sessionId = localStorage.getItem("guestSessionId");
    if (sessionId) {
      // ✅ USE THE HEADER YOUR BACKEND EXPECTS
      config.headers["X-Guest-Session-Id"] = sessionId;
      console.log(
        "🔑 Adding guest session header (X-Guest-Session-Id):",
        sessionId
      );
    }
  }
  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`);

    // Check if response contains a new session ID
    if (response.data?.sessionId) {
      const newSessionId = response.data.sessionId;
      const currentSessionId = localStorage.getItem("guestSessionId");

      if (newSessionId !== currentSessionId) {
        console.log("🔄 Updating session ID from response:", newSessionId);
        localStorage.setItem("guestSessionId", newSessionId);
      }
    }

    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.message);

    // Handle session-related errors
    if (error.response?.status === 401 || error.response?.status === 404) {
      console.log("🔄 Session invalid, clearing localStorage...");
      localStorage.removeItem("guestSessionId");
    }

    return Promise.reject(error);
  }
);

// Products API
export const productsAPI = {
  getAll: (filters = {}) => api.get("/products", { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => {
    console.log("🛒 Getting cart...");
    return api.get("/cart");
  },
  addToCart: (productId, quantity) => {
    console.log("🛒 Adding to cart:", productId, quantity);
    return api.post("/cart", { productId, quantity });
  },
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete("/cart"),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getByOrderNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  getBySession: (sessionId) => api.get(`/orders/guest/${sessionId}`),
};

// Guest API
export const guestAPI = {
  getSession: () => {
    console.log("👤 Getting guest session...");
    return api.get("/guest/session");
  },
};

export default api;
