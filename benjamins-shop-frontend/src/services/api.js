// src/services/api.js - ENHANCED VERSION
import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URI;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// ✅ IMPROVED Request Interceptor
api.interceptors.request.use((config) => {
  const requiresGuestSession =
    config.url?.includes("/cart") ||
    config.url?.includes("/orders") ||
    config.url?.includes("/guest/session"); // ✅ Include guest session route!

  if (requiresGuestSession) {
    const sessionId = localStorage.getItem("guestSessionId");
    if (sessionId) {
      // ✅ Use the header name your backend expects
      config.headers["X-Guest-Session-Id"] = sessionId;
      console.log("🔑 Adding guest session header to:", config.url, sessionId);
    } else {
      console.warn("⚠️ No session ID found for:", config.url);
    }
  }

  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`);

    // Handle session updates from backend
    const newSessionHeader =
      response.headers["x-new-guest-session"] ||
      response.headers["X-New-Guest-Session"];

    if (newSessionHeader) {
      const currentSessionId = localStorage.getItem("guestSessionId");
      if (newSessionHeader !== currentSessionId) {
        console.log("🔄 Updating session ID from header:", newSessionHeader);
        localStorage.setItem("guestSessionId", newSessionHeader);
      }
    }

    // Also check response data for session ID
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
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Handle session-related errors
    if (error.response?.status === 401 || error.response?.status === 404) {
      console.log("🔄 Session invalid, may need to refresh...");
      // Don't clear localStorage here - let GuestContext handle it
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
    console.log("👤 Getting/validating guest session...");
    return api.get("/guest/session");
  },
};

export default api;
