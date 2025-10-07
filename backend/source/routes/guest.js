// routes/guest.js - WITH DEBUG LOGS
import express from "express";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// GET /api/guest/session - Get guest session info
router.get("/session", guestAuth, (req, res) => {
  console.log("🔍 Guest session request details:");
  console.log("- Session ID:", req.sessionId);
  console.log("- Guest Session exists:", !!req.guestSession);
  console.log("- Guest Session data:", req.guestSession);

  res.json({
    sessionId: req.sessionId,
    message: "Guest session active",
    guestSession: req.guestSession
      ? {
          id: req.guestSession._id,
          cart: req.guestSession.cart,
          createdAt: req.guestSession.createdAt,
        }
      : null,
  });
});

export default router;
