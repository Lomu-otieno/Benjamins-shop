// src/context/CartContext.jsx - Updated with fallback
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

// Local storage fallback functions
const getLocalCart = () => {
  try {
    const localCart = localStorage.getItem("localCart");
    return localCart ? JSON.parse(localCart) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (cartItems) => {
  try {
    localStorage.setItem("localCart", JSON.stringify(cartItems));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
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

      // Try backend first
      const cart = await cartAPI.getCart();
      dispatch({ type: "SET_CART", payload: cart.data });
      console.log("✅ Cart loaded from backend");
    } catch (error) {
      console.log(
        "❌ Backend cart failed, using local storage:",
        error.message
      );

      // Fallback to local storage
      const localCart = getLocalCart();
      dispatch({ type: "SET_CART", payload: localCart });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      // Try backend first
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "ADD_ITEM", payload: response.data });
      return true;
    } catch (error) {
      console.log("❌ Backend add failed, using local storage:", error.message);

      // Fallback to local storage
      const currentItems = state.items;
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product?._id === productId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...currentItems,
          {
            product: { _id: productId },
            quantity,
            // Note: We don't have full product details in local storage
          },
        ];
      }

      dispatch({ type: "ADD_ITEM", payload: newItems });
      saveLocalCart(newItems);
      return true;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      dispatch({ type: "UPDATE_ITEM", payload: response.data });
    } catch (error) {
      console.log(
        "❌ Backend update failed, using local storage:",
        error.message
      );

      // Fallback to local storage
      const newItems =
        quantity <= 0
          ? state.items.filter((item) => item.product?._id !== productId)
          : state.items.map((item) =>
              item.product?._id === productId ? { ...item, quantity } : item
            );

      dispatch({ type: "UPDATE_ITEM", payload: newItems });
      saveLocalCart(newItems);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      dispatch({ type: "REMOVE_ITEM", payload: response.data });
    } catch (error) {
      console.log(
        "❌ Backend remove failed, using local storage:",
        error.message
      );

      // Fallback to local storage
      const newItems = state.items.filter(
        (item) => item.product?._id !== productId
      );
      dispatch({ type: "REMOVE_ITEM", payload: newItems });
      saveLocalCart(newItems);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.log(
        "❌ Backend clear failed, using local storage:",
        error.message
      );

      // Fallback to local storage
      dispatch({ type: "CLEAR_CART" });
      saveLocalCart([]);
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
