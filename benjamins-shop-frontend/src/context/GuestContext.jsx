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

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      // Get existing session ID from localStorage
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        console.log("🔄 Validating existing session:", existingSessionId);

        // Validate the existing session with backend
        try {
          const response = await guestAPI.getSession();
          const backendSessionId = response.data.sessionId;

          // If backend returns SAME session ID, we're good
          if (backendSessionId === existingSessionId) {
            console.log("✅ Session validated successfully");
            setSessionId(existingSessionId);
            setLoading(false);
            return;
          } else {
            console.log("🔄 Session changed, updating:", backendSessionId);
            localStorage.setItem("guestSessionId", backendSessionId);
            setSessionId(backendSessionId);
          }
        } catch (error) {
          console.log(
            "❌ Session validation failed, keeping existing:",
            error.message
          );
          setSessionId(existingSessionId);
        }
      } else {
        // No existing session - create new one via backend
        console.log("🆕 No existing session, creating new one");
        const response = await guestAPI.getSession();
        const newSessionId = response.data.sessionId;
        localStorage.setItem("guestSessionId", newSessionId);
        setSessionId(newSessionId);
        console.log("✅ New session created:", newSessionId);
      }
    } catch (error) {
      console.error("❌ Guest session initialization failed:", error);
      // Final fallback
      const fallbackSessionId =
        localStorage.getItem("guestSessionId") ||
        "guest_fallback_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestSessionId", fallbackSessionId);
      setSessionId(fallbackSessionId);
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
