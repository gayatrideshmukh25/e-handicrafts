import React, { createContext, useContext, useState, useEffect } from "react";
import * as api from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "buyer") fetchCart();
    else setCart({ items: [], totalAmount: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await api.getCart();
      setCart(data.cart);
    } catch {}
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.addToCart({ productId, quantity });
      setCart(data.cart);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.updateCartItem(productId, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.removeFromCart(productId);
      setCart(data.cart);
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart({ items: [], totalAmount: 0 });
    } catch {}
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
