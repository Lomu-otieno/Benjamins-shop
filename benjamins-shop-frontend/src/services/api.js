// src/services/api.js
import axios from "axios";

const API_BASE = "https://benjamins-shop.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: false,
});

// Enhanced request interceptor - only add guest session for cart/orders
api.interceptors.request.use((config) => {
  config.timeout = 10000;
  config.timeoutErrorMessage = "Request timeout - please try again";

  const requiresGuestSession =
    config.url?.includes("/cart") || config.url?.includes("/orders");
  if (requiresGuestSession) {
    const sessionId = localStorage.getItem("guestSessionId");
    if (sessionId) {
      config.headers["X-Guest-Session-Id"] = sessionId;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);

    // Check for new session ID in response headers OR data
    const headerSessionId = response.headers["x-new-guest-session"];
    const dataSessionId = response.data?.sessionId;

    if (headerSessionId) {
      console.log("Updating session ID from header:", headerSessionId);
      localStorage.setItem("guestSessionId", headerSessionId);
    } else if (dataSessionId) {
      console.log("Updating session ID from response data:", dataSessionId);
      localStorage.setItem("guestSessionId", dataSessionId);
    }

    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    }
    console.error("❌ API Error:", error.message);
    return Promise.reject(error);
  }
);

// Products API - public routes, no guest session needed
export const productsAPI = {
  getAll: (filters = {}) => api.get("/products", { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
};

// Cart API - requires guest session
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) =>
    api.post("/cart", { productId, quantity }),
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete("/cart"),
};

// Orders API - requires guest session
export const ordersAPI = {
  create: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response;
    } catch (error) {
      if (error.response?.status === 408) {
        throw new Error(
          "Order creation timed out. Please check your cart and try again."
        );
      }
      throw error;
    }
  },
};
// Guest API - requires guest session
export const guestAPI = {
  getSession: () => api.get("/guest/session"),
};

export default api;
