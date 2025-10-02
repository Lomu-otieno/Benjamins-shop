import GuestSession from "../models/GuestSession.js";

const guestAuth = async (req, res, next) => {
  try {
    let sessionId = req.headers["x-guest-session"] || req.cookies?.guestSession;

    if (!sessionId) {
      // Create new guest session
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;

      // Set session in response for client to store
      res.cookie("guestSession", sessionId, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
      });
      req.guestSession = newSession;
    } else {
      // Find existing session
      const session = await GuestSession.findOne({ sessionId }).populate(
        "cart.product"
      );
      if (!session) {
        // Create new session if not found
        const newSession = new GuestSession();
        await newSession.save();
        sessionId = newSession.sessionId;
        res.cookie("guestSession", sessionId, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
        req.guestSession = newSession;
      } else {
        req.guestSession = session;
      }
    }

    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error("Guest auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export default guestAuth;
