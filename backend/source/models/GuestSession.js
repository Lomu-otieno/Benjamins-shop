// models/GuestSession.js - FIXED VERSION
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const guestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: () => uuidv4(), // ✅ Use UUID for guaranteed uniqueness
      unique: true,
      required: true,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: { expires: "7d" },
    },
    // Add device fingerprint to prevent duplicates
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

// Add index for better performance
guestSessionSchema.index({ sessionId: 1 });

export default mongoose.model("GuestSession", guestSessionSchema);
