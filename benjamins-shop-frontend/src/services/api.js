import axios from "axios";

const API_BASE = "https://benjamins-shop.onrender.com/api";

// Create axios instance with guest session handling
const api = axios.create({
  baseURL: API_BASE,
});

// Add guest session ID to all requests
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("guestSessionId");
  if (sessionId) {
    config.headers["X-Guest-Session-Id"] = sessionId;
  }
  return config;
});

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

// Upload API
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadMultiple: (formData) =>
    api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteImage: (publicId) => api.delete(`/upload/${publicId}`),
};

export default api;
