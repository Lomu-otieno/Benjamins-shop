// src/context/GuestContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { guestAPI } from "../services/api";

const GuestContext = createContext();

// Create a custom hook for using guest context
const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
};

// Export the provider component separately
const GuestProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      // Generate a session ID and store it
      const newSessionId = "guest_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestSessionId", newSessionId);
      setSessionId(newSessionId);

      // Test the session
      await guestAPI.getSession();
    } catch (error) {
      console.log("Guest session initialized");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    sessionId,
    loading,
  };

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
};

export { GuestProvider, useGuest };
