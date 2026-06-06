// import axios from "axios";

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   },
// );

// export const register = (d) => API.post("/auth/register", d);
// export const login = (d) => API.post("/auth/login", d);
// export const getMe = () => API.get("/auth/me");
// export const updateProfile = (d) => API.put("/auth/profile", d);
// export const changePassword = (d) => API.put("/auth/change-password", d);
// export const getProducts = (p) => API.get("/products", { params: p });
// export const getProduct = (id) => API.get(`/products/${id}`);
// export const getFeaturedProducts = () => API.get("/products/featured");
// export const createProduct = (d) => API.post("/products", d);
// export const updateProduct = (id, d) => API.put(`/products/${id}`, d);
// export const deleteProduct = (id) => API.delete(`/products/${id}`);
// export const getMyProducts = () => API.get("/products/seller/my-products");
// export const getCart = () => API.get("/cart");
// export const addToCart = (d) => API.post("/cart/add", d);
// export const updateCartItem = (id, d) => API.put(`/cart/update/${id}`, d);
// export const removeFromCart = (id) => API.delete(`/cart/remove/${id}`);
// export const clearCart = () => API.delete("/cart/clear");
// export const placeOrder = (d) => API.post("/orders", d);
// export const getMyOrders = () => API.get("/orders/my-orders");
// export const getOrder = (id) => API.get(`/orders/${id}`);
// export const cancelOrder = (id, d) => API.put(`/orders/${id}/cancel`, d);
// export const getSellerOrders = () => API.get("/orders/seller-orders");
// export const updateOrderStatus = (id, d) => API.put(`/orders/${id}/status`, d);
// export const getAllOrders = () => API.get("/orders/all");
// export const getProductReviews = (pid) => API.get(`/reviews/product/${pid}`);
// export const addReview = (d) => API.post("/reviews", d);
// export const deleteReview = (id) => API.delete(`/reviews/${id}`);
// export const replyToReview = (id, d) => API.put(`/reviews/${id}/reply`, d);
// export const getWishlist = () => API.get("/wishlist");
// export const toggleWishlist = (d) => API.post("/wishlist/toggle", d);
// export const removeFromWishlist = (id) => API.delete(`/wishlist/${id}`);
// export const createRazorpayOrder = (d) => API.post("/payment/create-order", d);
// export const verifyRazorpayPayment = (d) => API.post("/payment/verify", d);
// export const getAdminAnalytics = () => API.get("/admin/analytics");
// export const getAdminUsers = () => API.get("/admin/users");
// export const getAdminSellers = () => API.get("/admin/sellers");
// export const toggleBlockUser = (id) => API.put(`/admin/users/${id}/block`);
// export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
// export const approveSeller = (id, d) =>
//   API.put(`/admin/sellers/${id}/approve`, d);
// export const getAdminProducts = () => API.get("/admin/products");
// export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
// export const getAdminReviews = () => API.get("/admin/reviews");
// export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);
// export const getSellerDashboard = () => API.get("/seller/dashboard");
// export const getSellerReviews = () => API.get("/seller/reviews");

// export default API;

// // Reviews (updated)
// export const canReviewProduct = (orderId, productId) =>
//   API.get(`/reviews/can-review/${orderId}/${productId}`);
// export const getPendingReviews = () => API.get("/reviews/pending");

// export const createPaymentLink = (data) =>
//   axios.post(`${API}/create-payment-link`, data);

// export const markOrderPaid = (data) => axios.post(`${API}/mark-paid`, data);
// import axios from "axios";

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
// });

// /* ========================
//    AUTH
// ======================== */
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   },
// );

// /* ========================
//    AUTH APIs
// ======================== */
// export const register = (d) => API.post("/auth/register", d);
// export const login = (d) => API.post("/auth/login", d);
// export const getMe = () => API.get("/auth/me");
// export const updateProfile = (d) => API.put("/auth/profile", d);
// export const changePassword = (d) => API.put("/auth/change-password", d);

// /* ========================
//    PRODUCTS
// ======================== */
// export const getProducts = (p) => API.get("/products", { params: p });
// export const getProduct = (id) => API.get(`/products/${id}`);
// export const getFeaturedProducts = () => API.get("/products/featured");
// export const createProduct = (d) => API.post("/products", d);
// export const updateProduct = (id, d) => API.put(`/products/${id}`, d);
// export const deleteProduct = (id) => API.delete(`/products/${id}`);
// export const getMyProducts = () => API.get("/products/seller/my-products");

// /* ========================
//    CART
// ======================== */
// export const getCart = () => API.get("/cart");
// export const addToCart = (d) => API.post("/cart/add", d);
// export const updateCartItem = (id, d) => API.put(`/cart/update/${id}`, d);
// export const removeFromCart = (id) => API.delete(`/cart/remove/${id}`);
// export const clearCart = () => API.delete("/cart/clear");

// /* ========================
//    ORDERS
// ======================== */
// export const placeOrder = (d) => API.post("/orders", d);
// export const getMyOrders = () => API.get("/orders/my-orders");
// export const getOrder = (id) => API.get(`/orders/${id}`);
// export const cancelOrder = (id, d) => API.put(`/orders/${id}/cancel`, d);
// export const getSellerOrders = () => API.get("/orders/seller-orders");
// export const updateOrderStatus = (id, d) => API.put(`/orders/${id}/status`, d);
// export const getAllOrders = () => API.get("/orders/all");

// /* ========================
//    REVIEWS
// ======================== */
// export const getProductReviews = (pid) => API.get(`/reviews/product/${pid}`);
// export const addReview = (d) => API.post("/reviews", d);
// export const deleteReview = (id) => API.delete(`/reviews/${id}`);
// export const replyToReview = (id, d) => API.put(`/reviews/${id}/reply`, d);

// export const canReviewProduct = (orderId, productId) =>
//   API.get(`/reviews/can-review/${orderId}/${productId}`);
// export const getPendingReviews = () => API.get("/reviews/pending");

// /* ========================
//    WISHLIST
// ======================== */
// export const getWishlist = () => API.get("/wishlist");
// export const toggleWishlist = (d) => API.post("/wishlist/toggle", d);
// export const removeFromWishlist = (id) => API.delete(`/wishlist/${id}`);

// /* ========================
//    PAYMENT (Razorpay Payment Link FLOW)
// ======================== */

// // ✅ CREATE PAYMENT LINK
// export const createPaymentLink = (data) =>
//   API.post("/payment/create-payment-link", data);

// // ✅ MARK ORDER AS PAID AFTER SUCCESS
// export const markOrderPaid = (data) => API.post("/payment/mark-paid", data);

// /* ========================
//    ADMIN
// ======================== */
// export const getAdminAnalytics = () => API.get("/admin/analytics");
// export const getAdminUsers = () => API.get("/admin/users");
// export const getAdminSellers = () => API.get("/admin/sellers");
// export const toggleBlockUser = (id) => API.put(`/admin/users/${id}/block`);
// export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
// export const approveSeller = (id, d) =>
//   API.put(`/admin/sellers/${id}/approve`, d);
// export const getAdminProducts = () => API.get("/admin/products");
// export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
// export const getAdminReviews = () => API.get("/admin/reviews");
// export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);

// /* ========================
//    SELLER
// ======================== */
// export const getSellerDashboard = () => API.get("/seller/dashboard");
// export const getSellerReviews = () => API.get("/seller/reviews");

// export default API;

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export const register = (d) => API.post("/auth/register", d);
export const login = (d) => API.post("/auth/login", d);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (d) => API.put("/auth/profile", d);
export const changePassword = (d) => API.put("/auth/change-password", d);
export const getProducts = (p) => API.get("/products", { params: p });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getFeaturedProducts = () => API.get("/products/featured");
export const createProduct = (d) => API.post("/products/create", d);
export const updateProduct = (id, d) => API.put(`/products/${id}`, d);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getMyProducts = () => API.get("/products/seller/my-products");
export const getCart = () => API.get("/cart");
export const addToCart = (d) => API.post("/cart/add", d);
export const updateCartItem = (id, d) => API.put(`/cart/update/${id}`, d);
export const removeFromCart = (id) => API.delete(`/cart/remove/${id}`);
export const clearCart = () => API.delete("/cart/clear");
export const placeOrder = (d) => API.post("/orders", d);
export const getMyOrders = () => API.get("/orders/my-orders");
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id, d) => API.put(`/orders/${id}/cancel`, d);
export const getSellerOrders = () => API.get("/orders/seller-orders");
export const updateOrderStatus = (id, d) => API.put(`/orders/${id}/status`, d);
export const getAllOrders = () => API.get("/orders/all");
export const getProductReviews = (pid) => API.get(`/reviews/product/${pid}`);
export const addReview = (d) => API.post("/reviews", d);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const replyToReview = (id, d) => API.put(`/reviews/${id}/reply`, d);
export const getWishlist = () => API.get("/wishlist");
export const toggleWishlist = (d) => API.post("/wishlist/toggle", d);
export const removeFromWishlist = (id) => API.delete(`/wishlist/${id}`);
export const createRazorpayOrder = (d) => API.post("/payment/create-order", d);
export const verifyRazorpayPayment = (d) => API.post("/payment/verify", d);
export const getAdminAnalytics = () => API.get("/admin/analytics");
export const getAdminUsers = () => API.get("/admin/users");
export const getAdminSellers = () => API.get("/admin/sellers");
export const toggleBlockUser = (id) => API.put(`/admin/users/${id}/block`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const approveSeller = (id, d) =>
  API.put(`/admin/sellers/${id}/approve`, d);
export const getAdminProducts = () => API.get("/admin/products");
export const adminDeleteProduct = (id) => API.delete(`/admin/products/${id}`);
export const getAdminReviews = () => API.get("/admin/reviews");
export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);
export const getSellerDashboard = () => API.get("/seller/dashboard");
export const getSellerReviews = () => API.get("/seller/reviews");

export default API;

// Reviews (updated)
export const canReviewProduct = (orderId, productId) =>
  API.get(`/reviews/can-review/${orderId}/${productId}`);
export const getPendingReviews = () => API.get("/reviews/pending");
