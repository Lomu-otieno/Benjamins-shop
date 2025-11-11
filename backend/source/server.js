import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import serverPinger from "./utils/serverPinger.js";
// Import routes
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import guestRoutes from "./routes/guest.js";
import uploadRoutes from "./routes/upload.js";
import cleanupDuplicateSessions from "./utils/cleanupSessions.js";

dotenv.config();

const app = express();

// Connect to database
connectDB().then(() => {
  cleanupDuplicateSessions();
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.LOCALHOST,
      process.env.FRONTEND_URI_ONE,
      process.env.FRONTEND_URI_TWO,
      process.env.FRONTEND_URI_THREE,
      process.env.PASSWORD_URI,
      process.env.SERVER_URI,
      process.env.VITE_URI,
      process.env.LIVE_FRONTEND,
      "https://benjamins-shop-54vbkrl8u-jonah-lomus-projects.vercel.app", // your deployed frontend
      "https://benjamins-shop-jaowuy8ce-jonah-lomus-projects.vercel.app", // fallback / alternate deployed frontend
      "http://localhost:5173",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Guest-Session-Id",
      "x-guest-session",
      "X-Requested-With",
      "x-admin-token",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ["X-New-Guest-Session", "x-new-guest-session"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Benjamis API is running" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  serverPinger.start(10);
});

export default app;
