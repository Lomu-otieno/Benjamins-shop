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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      // DON'T create session ID in frontend - let backend handle it
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        console.log("Found existing session ID:", existingSessionId);
        setSessionId(existingSessionId);
      }

      // Always call backend to validate/get session
      const response = await guestAPI.getSession();

      // Backend will either:
      // 1. Return the existing session if valid
      // 2. Create a new session and return it in headers
      const backendSessionId = response.data.sessionId;

      if (backendSessionId && backendSessionId !== existingSessionId) {
        console.log("Backend provided session ID:", backendSessionId);
        localStorage.setItem("guestSessionId", backendSessionId);
        setSessionId(backendSessionId);
      }

      console.log("Guest session initialized with backend");
    } catch (error) {
      console.error("Guest session initialization error:", error);

      // Only create fallback if absolutely necessary
      if (!sessionId) {
        const fallbackSessionId =
          "guest_fallback_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("guestSessionId", fallbackSessionId);
        setSessionId(fallbackSessionId);
        console.log("Created fallback session ID:", fallbackSessionId);
      }
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
