// middleware/guestAuth.js - ADD DEBUG LOGGING
import GuestSession from "../models/GuestSession.js";

const guestAuth = async (req, res, next) => {
  try {
    console.log("🔍 Guest Auth - Headers:", {
      "x-guest-session": req.headers["x-guest-session"],
      "x-guest-session-id": req.headers["x-guest-session-id"],
    });

    let sessionId =
      req.headers["x-guest-session"] ||
      req.headers["x-guest-session-id"] ||
      req.cookies?.guestSession;

    console.log("🔍 Extracted sessionId:", sessionId);

    if (!sessionId) {
      console.log("🆕 No session ID in request, creating new session...");
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;

      console.log("✅ Created NEW session:", sessionId);
      res.setHeader("X-New-Guest-Session", sessionId);
      req.guestSession = newSession;
    } else {
      console.log("🔍 Looking for existing session in DB:", sessionId);
      const session = await GuestSession.findOne({ sessionId }).populate(
        "cart.product"
      );

      if (!session) {
        console.log("❌ Session not found in DB, creating new one...");
        const newSession = new GuestSession();
        await newSession.save();
        sessionId = newSession.sessionId;
        res.setHeader("X-New-Guest-Session", sessionId);
        req.guestSession = newSession;
      } else {
        console.log(
          "✅ Found EXISTING session, cart items:",
          session.cart.length
        );
        req.guestSession = session;
      }
    }

    req.sessionId = sessionId;
    console.log("🎯 Final session ID:", sessionId);
    next();
  } catch (error) {
    console.error("❌ Guest auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export default guestAuth;
