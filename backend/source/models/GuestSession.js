// models/GuestSession.js - FIXED
import mongoose from "mongoose";

const guestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: () => "guest_" + Math.random().toString(36).substr(2, 9), // Consistent with middleware
      unique: true,
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
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expires: "7d" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GuestSession", guestSessionSchema);
