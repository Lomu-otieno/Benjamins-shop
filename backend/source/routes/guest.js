// routes/guest.js - IMPROVED VERSION
import express from "express";
import GuestSession from "../models/GuestSession.js";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// GET /api/guest/session - Get or create guest session
router.get("/session", guestAuth, async (req, res) => {
  try {
    const sessionId = req.sessionId;
    const guestSession = req.guestSession;

    console.log("🎯 Guest session endpoint - Session ID:", sessionId);

    // Set response headers for frontend
    res.setHeader("X-New-Guest-Session", sessionId);
    res.setHeader("x-new-guest-session", sessionId);

    res.json({
      sessionId: sessionId,
      message: "Guest session active",
      cartItems: guestSession?.cart?.length || 0,
      createdAt: guestSession?.createdAt,
    });
  } catch (error) {
    console.error("💥 Guest session endpoint error:", error);
    res.status(500).json({ error: "Failed to get guest session" });
  }
});

// ADD THIS ROUTE FOR DEBUGGING
router.get("/debug", (req, res) => {
  res.json({
    headers: req.headers,
    "x-guest-session-received": req.headers["x-guest-session"],
    "x-guest-session-id-received": req.headers["x-guest-session-id"],
  });
});

export default router;
