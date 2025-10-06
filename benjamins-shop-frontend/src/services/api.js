// src/services/api.js
import axios from "axios";

const API_BASE = "https://benjamins-shop.onrender.com/api";

// Create axios instance with guest session handling
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // Increased timeout
  withCredentials: false, // Important for CORS
});

// Add guest session ID to all requests
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("guestSessionId");
  if (sessionId) {
    config.headers["X-Guest-Session-Id"] = sessionId;
  }

  // Log request for debugging
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Enhanced response interceptor for better error handling
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
      // Server responded with error status
      errorMessage =
        error.response.data?.error || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = "No response from server. The backend might be down.";
    } else {
      errorMessage = error.message;
    }

    console.error("❌ API Error:", {
      message: errorMessage,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(new Error(errorMessage));
  }
);

// Products API
export const productsAPI = {
  getAll: (filters = {}) => api.get("/products", { params: filters }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) =>
    api.post("/cart", { productId, quantity }),
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
  getSession: () => api.get("/guest/session"),
};

export default api;
