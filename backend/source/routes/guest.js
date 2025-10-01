// routes/guest.js
import express from "express";
import guestAuth from "../middleware/guestAuth.js";

const router = express.Router();

// GET /api/guest/session - Get guest session info
router.get("/session", guestAuth, (req, res) => {
  res.json({
    sessionId: req.sessionId,
    message: "Guest session active",
  });
});

export default router;
