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
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);

  // Only add guest session header for cart and orders routes
  const requiresGuestSession =
    config.url?.includes("/cart") ||
    config.url?.includes("/orders") ||
    config.url?.includes("/guest");

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
    return response;
  },
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.code === "ECONNREFUSED") {
      errorMessage =
        "Cannot connect to server. Please check if the backend is running.";
    } else if (error.code === "NETWORK_ERROR") {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error.response) {
      errorMessage =
        error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server. The backend might be down.";
    } else {
      errorMessage = error.message;
    }

    console.error("❌ API Error:", errorMessage);

    return Promise.reject(new Error(errorMessage));
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
  create: (orderData) => api.post("/orders", orderData),
  getByOrderNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  getBySession: (sessionId) => api.get(`/orders/guest/${sessionId}`),
};

// Guest API - requires guest session
export const guestAPI = {
  getSession: () => api.get("/guest/session"),
};

export default api;
