// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload, loading: false };
    case "ADD_ITEM":
      return { ...state, items: action.payload };
    case "UPDATE_ITEM":
      return { ...state, items: action.payload };
    case "REMOVE_ITEM":
      return { ...state, items: action.payload };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const cart = await cartAPI.getCart();
      dispatch({ type: "SET_CART", payload: cart.data });
    } catch (error) {
      // If cart fails due to CORS or other issues, start with empty cart
      console.log(
        "Cart fetch failed, starting with empty cart:",
        error.message
      );
      dispatch({ type: "SET_CART", payload: [] });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "ADD_ITEM", payload: response.data });
      return true;
    } catch (error) {
      console.error("Failed to add to cart:", error.message);
      // You could implement local cart storage as fallback
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      dispatch({ type: "UPDATE_ITEM", payload: response.data });
    } catch (error) {
      console.error("Failed to update quantity:", error.message);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      dispatch({ type: "REMOVE_ITEM", payload: response.data });
    } catch (error) {
      console.error("Failed to remove from cart:", error.message);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Failed to clear cart:", error.message);
      throw error;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + item.product?.price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartProvider, useCart };
