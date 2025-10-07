// middleware/guestAuth.js - IMPROVED VERSION
import GuestSession from "../models/GuestSession.js";

const guestAuth = async (req, res, next) => {
  try {
    let sessionId = req.headers["x-guest-session-id"];
    console.log("🔍 Guest Auth - Request received with session ID:", sessionId);

    // If no session ID provided, just continue without creating one
    // Let the frontend handle session creation via /api/guest/session
    if (!sessionId) {
      console.log("⚠️  No session ID provided - continuing without session");
      req.sessionId = null;
      req.guestSession = null;
      return next();
    }

    // Validate session format
    if (!sessionId.startsWith("guest_")) {
      console.log("❌ Invalid session format:", sessionId);
      return res.status(400).json({ error: "Invalid session format" });
    }

    // Try to find existing session
    console.log("🔎 Looking for session in database:", sessionId);
    const session = await GuestSession.findOne({ sessionId }).populate(
      "cart.product"
    );

    if (session) {
      console.log("✅ Found existing session");
      req.guestSession = session;
      req.sessionId = sessionId;
    } else {
      console.log("❌ Session not found in database");
      req.guestSession = null;
      req.sessionId = null;
      // Don't create new session here - let frontend handle it
    }

    next();
  } catch (error) {
    console.error("💥 Guest auth error:", error);
    req.sessionId = null;
    req.guestSession = null;
    next();
  }
};

export default guestAuth;
