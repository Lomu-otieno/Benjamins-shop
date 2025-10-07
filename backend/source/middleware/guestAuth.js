// middleware/guestAuth.js
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
      console.log("✅ Created new session:", sessionId);

      res.setHeader("X-New-Guest-Session", sessionId);
      req.guestSession = newSession;
    } else {
      console.log("🔎 Looking for existing session:", sessionId);
      const session = await GuestSession.findOne({ sessionId }).populate(
        "cart.product"
      );

      if (!session) {
        console.log("❌ Session not found - creating new one");
        const newSession = new GuestSession();
        await newSession.save();
        sessionId = newSession.sessionId;
        console.log("✅ Created replacement session:", sessionId);

        res.setHeader("X-New-Guest-Session", sessionId);
        req.guestSession = newSession;
      } else {
        console.log("✅ Found existing session");
        req.guestSession = session;
      }
    }

    req.sessionId = sessionId;
    console.log("🎯 Final session ID:", sessionId);
    next();
  } catch (error) {
    console.error("Guest auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export default guestAuth;
