// src/context/GuestContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { guestAPI } from "../services/api";

const GuestContext = createContext();

const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
};

const GuestProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false); // Track if already initialized

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      // Check if session already exists in localStorage
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        // Use existing session
        setSessionId(existingSessionId);
        console.log("Using existing guest session:", existingSessionId);

        // Validate existing session
        try {
          await guestAPI.getSession();
          console.log("Existing guest session validated");
        } catch (error) {
          console.log(
            "Existing session validation failed, keeping session:",
            error.message
          );
        }
      } else {
        // Create new session only if none exists
        const newSessionId = "guest_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestSessionId", newSessionId);
        setSessionId(newSessionId);
        console.log("Created new guest session:", newSessionId);

        // Try to validate new session
        try {
          await guestAPI.getSession();
          console.log("New guest session validated");
        } catch (error) {
          console.log("New session validation failed:", error.message);
        }
      }
    } catch (error) {
      console.error("Guest session initialization error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Method to manually refresh session if needed
  const refreshSession = async () => {
    const newSessionId = "guest_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("guestSessionId", newSessionId);
    setSessionId(newSessionId);
    console.log("Refreshed guest session:", newSessionId);
  };

  const value = {
    sessionId,
    loading,
    refreshSession, // Optional: export if you need manual refresh
  };

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
};

export { GuestProvider, useGuest };
