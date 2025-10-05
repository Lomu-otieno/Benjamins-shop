// src/context/GuestContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { guestAPI } from "../services/api";

const GuestContext = createContext();

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
};

export const GuestProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      // Check if session exists in localStorage
      const savedSession = localStorage.getItem("guestSessionId");

      if (savedSession) {
        // Verify session is still valid
        try {
          await guestAPI.getSession();
          setSessionId(savedSession);
        } catch (error) {
          // Session invalid, create new one
          await createNewSession();
        }
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error("Failed to initialize guest session:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      // The session is created automatically when making first authenticated request
      // For now, we'll generate a session ID and store it
      const newSessionId = "guest_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestSessionId", newSessionId);
      setSessionId(newSessionId);
    } catch (error) {
      console.error("Failed to create guest session:", error);
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
