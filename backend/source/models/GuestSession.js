import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;
const FOUR_MONTHS_SECONDS = 120 * 24 * 60 * 60;

const guestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + FOUR_MONTHS_MS),
      index: { expires: FOUR_MONTHS_SECONDS },
    },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model("GuestSession", guestSessionSchema);
