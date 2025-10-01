// models/GuestSession.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const guestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: uuidv4,
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
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: { expires: "7d" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GuestSession", guestSessionSchema);
