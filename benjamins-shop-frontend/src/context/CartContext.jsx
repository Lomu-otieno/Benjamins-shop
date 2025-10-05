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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
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
      dispatch({ type: "SET_CART", payload: cart });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const updatedCart = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "ADD_ITEM", payload: updatedCart });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await cartAPI.updateCartItem(productId, quantity);
      dispatch({ type: "UPDATE_ITEM", payload: updatedCart });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartAPI.removeFromCart(productId);
      dispatch({ type: "REMOVE_ITEM", payload: updatedCart });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
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
