import React, { createContext, useEffect, useState, useRef } from "react";
import { guestAPI } from "../services/api";

export const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
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
      retryCount.current = 0;
      const existingSessionId = localStorage.getItem("guestSessionId");

      if (existingSessionId) {
        await validateAndSetSession(existingSessionId);
      } else {
        await createNewSession();
      }
    } catch {
      await handleInitializationError();
    }
  };

  const validateAndSetSession = async (sessionIdToValidate) => {
    try {
      const response = await guestAPI.getSession();
      const backendSessionId = response.data.sessionId;

      if (backendSessionId !== sessionIdToValidate) {
        localStorage.setItem("guestSessionId", backendSessionId);
        setSessionId(backendSessionId);
      } else {
        setSessionId(sessionIdToValidate);
      }

      setBackendAvailable(true);
      setLoading(false);
    } catch (error) {
      if (retryCount.current < maxRetries && error.response?.status !== 404) {
        retryCount.current++;
        setTimeout(
          () => validateAndSetSession(sessionIdToValidate),
          1000 * retryCount.current
        );
        return;
      }

      if (error.response?.status === 404) {
        await createNewSession();
      } else {
        setSessionId(sessionIdToValidate);
        setBackendAvailable(false);
        setLoading(false);
      }
    }
  };

  const createNewSession = async () => {
    try {
      const response = await guestAPI.getSession();
      const newSessionId = response.data.sessionId;
      localStorage.setItem("guestSessionId", newSessionId);
      setSessionId(newSessionId);
      setBackendAvailable(true);
    } catch {
      await handleInitializationError();
    } finally {
      setLoading(false);
    }
  };

  const handleInitializationError = async () => {
    const existingSessionId = localStorage.getItem("guestSessionId");
    if (!existingSessionId) {
      const fallbackSessionId = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("guestSessionId", fallbackSessionId);
      setSessionId(fallbackSessionId);
    } else {
      setSessionId(existingSessionId);
    }
    setBackendAvailable(false);
    setLoading(false);
  };

  const clearSession = () => {
    localStorage.removeItem("guestSessionId");
    setSessionId(null);
    initializeGuestSession();
  };

  return (
    <GuestContext.Provider
      value={{ sessionId, loading, backendAvailable, clearSession }}
    >
      {children}
    </GuestContext.Provider>
  );
};
