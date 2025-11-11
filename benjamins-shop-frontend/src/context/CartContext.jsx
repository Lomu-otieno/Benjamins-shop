// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI, guestAPI } from "../services/api";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload, loading: false };
    case "ADD_ITEM":
    case "UPDATE_ITEM":
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

// Local storage fallback
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

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    initializeSessionAndCart();
  }, []);

  const initializeSessionAndCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // ✅ Ensure session exists before requesting cart
      await guestAPI.getSession();

      const cart = await cartAPI.getCart();
      dispatch({ type: "SET_CART", payload: cart.data });
      console.log("✅ Cart loaded from backend after session restore");
    } catch (error) {
      console.log("❌ Using local fallback cart:", error.message);
      const localCart = getLocalCart();
      dispatch({ type: "SET_CART", payload: localCart });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: "ADD_ITEM", payload: response.data });
      return true;
    } catch (error) {
      console.log("❌ Backend add failed, using local storage:", error.message);

      const currentItems = state.items;
      const existingItem = currentItems.find(
        (item) => item.product?._id === productId
      );

      let newItems;
      if (existingItem) {
        newItems = currentItems.map((item) =>
          item.product?._id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...currentItems, { product: { _id: productId }, quantity }];
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

      dispatch({ type: "CLEAR_CART" });
      saveLocalCart([]);
    }
  };

  const getCartTotal = () =>
    state.items.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

  const getCartCount = () =>
    state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        loading: state.loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
