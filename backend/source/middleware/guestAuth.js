// middleware/guestAuth.js - WITH BETTER LOGGING
import GuestSession from "../models/GuestSession.js";

const guestAuth = async (req, res, next) => {
  try {
    let sessionId = req.headers["x-guest-session-id"];
    console.log("🔍 Guest Auth - Received session ID:", sessionId);

    if (!sessionId) {
      console.log("🆕 No session ID - creating new session");
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;
      console.log("✅ Created NEW session:", sessionId);
      res.setHeader("X-New-Guest-Session", sessionId);
      req.guestSession = newSession;
      req.sessionId = sessionId;
      return next();
    }

    // Try to find existing session
    console.log("🔎 Looking for existing session:", sessionId);
    const session = await GuestSession.findOne({ sessionId }).populate(
      "cart.product"
    );

    if (!session) {
      console.log("❌ Session NOT FOUND in database:", sessionId);
      console.log("🆕 Creating REPLACEMENT session");
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;
      console.log("✅ Created REPLACEMENT session:", sessionId);
      res.setHeader("X-New-Guest-Session", sessionId);
      req.guestSession = newSession;
    } else {
      console.log("✅ Found EXISTING session:", sessionId);
      req.guestSession = session;
    }

    req.sessionId = sessionId;
    console.log("🎯 Final session ID for request:", sessionId);
    next();
  } catch (error) {
    console.error("💥 Guest auth error:", error);
    req.sessionId = req.headers["x-guest-session-id"] || "guest_error_fallback";
    next();
  }
};

export default guestAuth;
