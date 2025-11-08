// middleware/guestAuth.js - ADD DEBUG LOGGING
const guestAuth = async (req, res, next) => {
  try {
    console.log("🔍 Guest Auth - Headers received:", req.headers);

    let sessionId = req.headers["x-guest-session"] || req.cookies?.guestSession;
    console.log("🔍 Extracted sessionId:", sessionId);

    if (!sessionId) {
      console.log("🆕 No session ID found, creating new session...");
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;

      console.log("✅ New session created:", sessionId);

      // Set headers for frontend
      res.setHeader("x-new-guest-session", sessionId);
      req.guestSession = newSession;
    } else {
      console.log("🔍 Looking for existing session:", sessionId);
      const session = await GuestSession.findOne({ sessionId }).populate(
        "cart.product"
      );

      if (!session) {
        console.log("❌ Session not found in DB, creating new one...");
        const newSession = new GuestSession();
        await newSession.save();
        sessionId = newSession.sessionId;
        res.setHeader("x-new-guest-session", sessionId);
        req.guestSession = newSession;
      } else {
        console.log("✅ Existing session found");
        req.guestSession = session;
      }
    }

    req.sessionId = sessionId;
    console.log("🔍 Final sessionId being used:", sessionId);
    next();
  } catch (error) {
    console.error("❌ Guest auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
