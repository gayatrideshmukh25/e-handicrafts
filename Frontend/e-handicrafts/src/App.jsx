import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Buyer
import Home from './pages/buyer/Home';
import ProductDetail from './pages/buyer/ProductDetail';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';
import OrderDetailPage from './pages/buyer/OrderDetailPage';
import WishlistPage from './pages/buyer/WishlistPage';
import ProfilePage from './pages/buyer/ProfilePage';

// Seller
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import ProductForm from './pages/seller/ProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import SellerReviews from './pages/seller/SellerReviews';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';

// Protected route guard
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products/:id" element={<ProductDetail />} />

      {/* Buyer */}
      <Route path="/cart"      element={<ProtectedRoute roles={['buyer']}><CartPage /></ProtectedRoute>} />
      <Route path="/checkout"  element={<ProtectedRoute roles={['buyer']}><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders"    element={<ProtectedRoute roles={['buyer']}><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute roles={['buyer']}><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/wishlist"  element={<ProtectedRoute roles={['buyer']}><WishlistPage /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Seller */}
      <Route path="/seller"                      element={<ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>} />
      <Route path="/seller/products"             element={<ProtectedRoute roles={['seller']}><SellerProducts /></ProtectedRoute>} />
      <Route path="/seller/products/new"         element={<ProtectedRoute roles={['seller']}><ProductForm /></ProtectedRoute>} />
      <Route path="/seller/products/edit/:id"    element={<ProtectedRoute roles={['seller']}><ProductForm /></ProtectedRoute>} />
      <Route path="/seller/orders"               element={<ProtectedRoute roles={['seller']}><SellerOrders /></ProtectedRoute>} />
      <Route path="/seller/reviews"              element={<ProtectedRoute roles={['seller']}><SellerReviews /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"           element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"     element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/sellers"   element={<ProtectedRoute roles={['admin']}><AdminSellers /></ProtectedRoute>} />
      <Route path="/admin/products"  element={<ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/orders"    element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/reviews"   element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', borderRadius: '10px' },
              success: { iconTheme: { primary: '#1a7a4a', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
            }}
          />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
