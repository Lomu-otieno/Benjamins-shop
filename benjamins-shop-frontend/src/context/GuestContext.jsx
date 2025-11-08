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
  const [backendAvailable, setBackendAvailable] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      console.log("🚀 Starting guest session initialization...");

      // Check for existing session in localStorage
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        console.log(
          "📋 Found existing session in localStorage:",
          existingSessionId
        );

        // ✅ CRITICAL FIX: Always validate with backend
        console.log("🔍 Validating session with backend...");
        try {
          const response = await guestAPI.getSession();
          const backendSessionId = response.data.sessionId;

          console.log("✅ Session validated with backend:", backendSessionId);

          // Update localStorage with the session ID from backend (in case it changed)
          if (backendSessionId !== existingSessionId) {
            console.log("🔄 Session ID updated from backend");
            localStorage.setItem("guestSessionId", backendSessionId);
            setSessionId(backendSessionId);
          } else {
            setSessionId(existingSessionId);
          }

          setBackendAvailable(true);
          setLoading(false);
          return;
        } catch (error) {
          console.error("❌ Session validation failed:", error);
          // If validation fails, the session might be invalid
          await createNewSession();
          return;
        }
      } else {
        // No session exists - create new one
        console.log("🆕 No existing session, creating new...");
        await createNewSession();
      }
    } catch (error) {
      console.error("❌ Guest session initialization error:", error);
      await handleInitializationError();
    }
  };

  const createNewSession = async () => {
    try {
      console.log("🆕 Creating new guest session via backend...");
      const response = await guestAPI.getSession();
      const newSessionId = response.data.sessionId;

      console.log("✅ New session created:", newSessionId);
      localStorage.setItem("guestSessionId", newSessionId);
      setSessionId(newSessionId);
      setBackendAvailable(true);
    } catch (error) {
      console.error("❌ Failed to create backend session:", error);
      await handleInitializationError();
    } finally {
      setLoading(false);
    }
  };

  const handleInitializationError = async () => {
    // Only use fallback if absolutely necessary
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
    setBackendAvailable(false);
    setLoading(false);
  };

  const refreshSession = async () => {
    setLoading(true);
    await initializeGuestSession();
  };

  const value = {
    sessionId,
    loading,
    backendAvailable,
    refreshSession,
  };

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
};

export { GuestProvider, useGuest };
