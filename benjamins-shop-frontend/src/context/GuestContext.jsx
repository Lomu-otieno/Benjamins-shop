// src/context/GuestContext.jsx - ENHANCED VERSION
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
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializeGuestSession();
  }, []);

  const initializeGuestSession = async () => {
    try {
      console.log("🚀 Starting guest session initialization...");
      retryCount.current = 0;

      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        console.log(
          "📋 Found existing session in localStorage:",
          existingSessionId
        );
        await validateAndSetSession(existingSessionId);
      } else {
        console.log("🆕 No existing session, creating new...");
        await createNewSession();
      }
    } catch (error) {
      console.error("❌ Guest session initialization error:", error);
      await handleInitializationError();
    }
  };

  const validateAndSetSession = async (sessionIdToValidate) => {
    try {
      console.log("🔍 Validating session with backend:", sessionIdToValidate);
      const response = await guestAPI.getSession();
      const backendSessionId = response.data.sessionId;

      console.log("✅ Session validated:", backendSessionId);

      // Update if backend returned a different session (duplicate resolved)
      if (backendSessionId !== sessionIdToValidate) {
        console.log("🔄 Session ID updated from backend (duplicate resolved)");
        localStorage.setItem("guestSessionId", backendSessionId);
        setSessionId(backendSessionId);
      } else {
        setSessionId(sessionIdToValidate);
      }

      setBackendAvailable(true);
      setLoading(false);
    } catch (error) {
      console.error("❌ Session validation failed:", error);

      // Retry logic for transient errors
      if (retryCount.current < maxRetries && error.response?.status !== 404) {
        retryCount.current += 1;
        console.log(
          `🔄 Retrying session validation (${retryCount.current}/${maxRetries})...`
        );
        setTimeout(
          () => validateAndSetSession(sessionIdToValidate),
          1000 * retryCount.current
        );
        return;
      }

      // If validation consistently fails, create new session
      if (error.response?.status === 404) {
        console.log("🗑️ Session not found in backend, creating new one...");
        await createNewSession();
      } else {
        // Network or other errors - use existing session but mark backend as down
        console.log("🌐 Backend unavailable, using local session");
        setSessionId(sessionIdToValidate);
        setBackendAvailable(false);
        setLoading(false);
      }
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
    const existingSessionId = localStorage.getItem("guestSessionId");
    if (!existingSessionId) {
      // Use a more unique fallback
      const fallbackSessionId = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      console.log("🆘 Creating unique fallback session:", fallbackSessionId);
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

  const clearSession = () => {
    localStorage.removeItem("guestSessionId");
    setSessionId(null);
    initializeGuestSession(); // Create fresh session
  };

  const value = {
    sessionId,
    loading,
    backendAvailable,
    refreshSession,
    clearSession, // Add method to clear duplicates
  };

  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
};

export { GuestProvider, useGuest };
