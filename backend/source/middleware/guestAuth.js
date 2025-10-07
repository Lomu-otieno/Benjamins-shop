// middleware/guestAuth.js - OPTIMIZED VERSION
import GuestSession from "../models/GuestSession.js";

const guestAuth = async (req, res, next) => {
  try {
    let sessionId = req.headers["x-guest-session-id"];

    // Quick validation first
    if (sessionId && !sessionId.startsWith("guest_")) {
      return res.status(400).json({ error: "Invalid session format" });
    }

    if (!sessionId) {
      // Create new session - minimal operation
      const newSession = new GuestSession();
      await newSession.save();
      req.sessionId = newSession.sessionId;
      req.guestSession = newSession;
      res.setHeader("X-New-Guest-Session", newSession.sessionId);
      return next();
    }

    // Find existing session with ONLY necessary fields
    const session = await GuestSession.findOne(
      { sessionId },
      { sessionId: 1, cart: 1 } // Only get needed fields
    ).lean(); // Use lean() for faster queries

    if (!session) {
      // Create new session if not found
      const newSession = new GuestSession();
      await newSession.save();
      req.sessionId = newSession.sessionId;
      req.guestSession = newSession;
      res.setHeader("X-New-Guest-Session", newSession.sessionId);
    } else {
      req.sessionId = sessionId;
      req.guestSession = session;
    }

    next();
  } catch (error) {
    console.error("Guest auth error:", error);
    // Don't block the request - continue with limited functionality
    req.sessionId = req.headers["x-guest-session-id"] || "guest_fallback";
    next();
  }
};

export default guestAuth;
