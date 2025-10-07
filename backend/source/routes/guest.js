// routes/guest.js - UPDATED
import express from "express";
import GuestSession from "../models/GuestSession.js"; // Import directly
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// GET /api/guest/session - Get or create guest session
router.get("/session", guestAuth, async (req, res) => {
  try {
    let sessionId = req.sessionId;
    let guestSession = req.guestSession;

    console.log("🎯 Guest session endpoint - Current session:", sessionId);

    // If no valid session exists, create a new one
    if (!sessionId || !guestSession) {
      console.log("🆕 Creating new guest session...");
      const newSession = new GuestSession();
      await newSession.save();
      sessionId = newSession.sessionId;
      guestSession = newSession;

      console.log("✅ Created new session:", sessionId);
      res.setHeader("X-New-Guest-Session", sessionId);
    }

    res.json({
      sessionId: sessionId,
      message: "Guest session active",
      guestSession: guestSession
        ? {
            id: guestSession._id,
            cart: guestSession.cart,
            createdAt: guestSession.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("💥 Guest session endpoint error:", error);
    res.status(500).json({ error: "Failed to get guest session" });
  }
});

export default router;
