import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const changePassword = (data) => API.put("/auth/change-password", data);

// Products
export const getProducts = (params) => API.get("/products", { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getFeaturedProducts = () => API.get("/products/featured");
export const createProduct = (data) => API.post("/products/create", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getMyProducts = () => API.get("/products/seller/my-products");

// Cart
export const getCart = () => API.get("/cart");
export const addToCart = (data) => API.post("/cart/add", data);
export const updateCartItem = (productId, data) =>
  API.put(`/cart/update/${productId}`, data);
export const removeFromCart = (productId) =>
  API.delete(`/cart/remove/${productId}`);
export const clearCart = () => API.delete("/cart/clear");

// Orders
export const placeOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/my-orders");
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id, data) => API.put(`/orders/${id}/cancel`, data);
export const getSellerOrders = () => API.get("/orders/seller-orders");
export const updateOrderStatus = (id, data) =>
  API.put(`/orders/${id}/status`, data);
export const getAllOrders = () => API.get("/orders/all");

// Reviews
export const getProductReviews = (productId) =>
  API.get(`/reviews/product/${productId}`);
export const addReview = (data) => API.post("/reviews", data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const replyToReview = (id, data) =>
  API.put(`/reviews/${id}/reply`, data);

// Wishlist
export const getWishlist = () => API.get("/wishlist");
export const toggleWishlist = (data) => API.post("/wishlist/toggle", data);
export const removeFromWishlist = (productId) =>
  API.delete(`/wishlist/${productId}`);

// Admin
export const getAdminAnalytics = () => API.get("/admin/analytics");
export const getAdminUsers = () => API.get("/admin/users");
export const getAdminSellers = () => API.get("/admin/sellers");
export const toggleBlockUser = (id) => API.put(`/admin/users/${id}/block`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const approveSeller = (id, data) =>
  API.put(`/admin/sellers/${id}/approve`, data);
export const getAdminProducts = () => API.get("/admin/products");
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
export const getAdminReviews = () => API.get("/admin/reviews");
export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);

// Seller
export const getSellerDashboard = () => API.get("/seller/dashboard");
export const getSellerReviews = () => API.get("/seller/reviews");

export default API;
