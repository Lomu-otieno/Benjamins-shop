// middleware/guestAuth.js - ENHANCED VERSION
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
      const newSession = new GuestSession({
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
      });

      await newSession.save();
      sessionId = newSession.sessionId;

      console.log("✅ Created NEW session:", sessionId);
      res.setHeader("X-New-Guest-Session", sessionId);
      req.guestSession = newSession;
    } else {
      console.log("🔍 Looking for existing session in DB:", sessionId);
      let session = await GuestSession.findOne({ sessionId });

      if (!session) {
        session = await GuestSession.findOne({
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip,
        }).sort({ createdAt: -1 });
      }

      if (!session) {
        console.log(
          "❌ Session not found in DB, checking for recent sessions..."
        );

        // ✅ Check if this device recently created a session (prevent duplicates)
        const recentSession = await GuestSession.findOne({
          userAgent: req.headers["user-agent"],
          createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
        }).sort({ createdAt: -1 });

        if (recentSession) {
          console.log(
            "🔄 Found recent session for this device:",
            recentSession.sessionId
          );
          sessionId = recentSession.sessionId;
          req.guestSession = recentSession;
          res.setHeader("X-New-Guest-Session", sessionId);
        } else {
          console.log("🆕 Creating fresh session...");
          const newSession = new GuestSession({
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip || req.connection.remoteAddress,
          });
          await newSession.save();
          sessionId = newSession.sessionId;
          res.setHeader("X-New-Guest-Session", sessionId);
          req.guestSession = newSession;
        }
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

    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      console.log("🔄 Duplicate session ID detected, retrying...");
      // Remove the duplicate session header and retry
      delete req.headers["x-guest-session"];
      delete req.headers["x-guest-session-id"];
      return guestAuth(req, res, next);
    }

    res.status(500).json({ error: "Authentication failed" });
  }
};

export default guestAuth;
