// src/context/GuestContext.jsx - FIXED VERSION
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
  const initialized = useRef(false);
  const initializationPromise = useRef(null); // Track the initialization promise

  useEffect(() => {
    // If already initializing, wait for it to complete
    if (initializationPromise.current) {
      initializationPromise.current.finally(() => setLoading(false));
      return;
    }

    if (initialized.current) return;

    initializationPromise.current = initializeGuestSession();
    initialized.current = true;

    initializationPromise.current.finally(() => {
      setLoading(false);
      initializationPromise.current = null;
    });
  }, []);

  const initializeGuestSession = async () => {
    try {
      console.log("🚀 Starting guest session initialization...");

      // Check for existing session FIRST
      const existingSessionId = localStorage.getItem("guestSessionId");
      console.log(
        "📋 Existing session ID from localStorage:",
        existingSessionId
      );

      if (existingSessionId) {
        console.log("🔄 Found existing session, setting state");
        setSessionId(existingSessionId);
        return; // STOP HERE - don't call backend
      }

      // Only call backend if no session exists
      console.log("🆕 No existing session, calling backend...");
      const response = await guestAPI.getSession();
      const backendSessionId = response.data.sessionId;

      console.log("✅ Backend provided session ID:", backendSessionId);
      localStorage.setItem("guestSessionId", backendSessionId);
      setSessionId(backendSessionId);
    } catch (error) {
      console.error("❌ Guest session initialization error:", error);

      // Final fallback - only create if absolutely necessary
      const existingSessionId = localStorage.getItem("guestSessionId");
      if (!existingSessionId) {
        const fallbackSessionId =
          "guest_fallback_" + Math.random().toString(36).substr(2, 9);
        console.log("🆘 Creating fallback session:", fallbackSessionId);
        localStorage.setItem("guestSessionId", fallbackSessionId);
        setSessionId(fallbackSessionId);
      } else {
        setSessionId(existingSessionId);
      }
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
