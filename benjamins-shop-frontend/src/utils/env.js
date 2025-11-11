// src/utils/env.js - Add this validation file
export const validateEnvironment = () => {
  const requiredEnvVars = ["VIT_SERVER_URI"];

  const missing = requiredEnvVars.filter((env) => !import.meta.env[env]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:", missing);

    // In development, show helpful error
    if (import.meta.env.DEV) {
      throw new Error(
        `Missing environment variables: ${missing.join(", ")}\n\n` +
          "Please check your .env.local file and make sure it contains:\n" +
          "VIT_SERVER_URI=https://benjamins-shop.onrender.com/api"
      );
    }

    // In production, this should never happen if Vercel is configured properly
    throw new Error("Application configuration error");
  }

  console.log("✅ All environment variables are properly set");
};

// Call this in your main App.jsx or main.jsx
// validateEnvironment();
