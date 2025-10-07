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
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        console.log("Found existing session ID:", existingSessionId);
        setSessionId(existingSessionId);
        return; // ✅ stop here, don’t call backend again
      }

      // Otherwise, ask backend to create new one
      const response = await guestAPI.getSession();
      const backendSessionId = response.data.sessionId;

      if (backendSessionId) {
        localStorage.setItem("guestSessionId", backendSessionId);
        setSessionId(backendSessionId);
      }
    } catch (error) {
      console.error("Guest session initialization error:", error);
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
