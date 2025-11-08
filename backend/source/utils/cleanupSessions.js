// utils/cleanupSessions.js
import GuestSession from "../models/GuestSession.js";
import mongoose from "mongoose";

const cleanupDuplicateSessions = async () => {
  try {
    console.log("🧹 Cleaning up duplicate sessions...");

    // Find sessions with same userAgent created within 1 minute of each other
    const duplicates = await GuestSession.aggregate([
      {
        $group: {
          _id: {
            userAgent: "$userAgent",
            timeWindow: {
              $dateToString: {
                format: "%Y-%m-%d-%H-%M",
                date: "$createdAt",
              },
            },
          },
          sessions: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    for (const duplicate of duplicates) {
      // Keep the most recent session, delete others
      const sessions = duplicate.sessions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const sessionsToDelete = sessions.slice(1); // All but the most recent

      for (const session of sessionsToDelete) {
        await GuestSession.findByIdAndDelete(session._id);
        console.log(`🗑️ Deleted duplicate session: ${session.sessionId}`);
      }
    }

    console.log("✅ Duplicate session cleanup completed");
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
};

// Run cleanup on startup and periodically
cleanupDuplicateSessions();
setInterval(cleanupDuplicateSessions, 30 * 60 * 1000); // Every 30 minutes

export default cleanupDuplicateSessions;
