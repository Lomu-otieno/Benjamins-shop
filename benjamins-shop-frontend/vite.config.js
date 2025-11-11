// vite.config.js - UPDATED
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ Change this to just "/"
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_SERVER_URI, // ✅ Point to your actual backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    // ✅ This ensures proper routing in production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // ✅ Add this for SPA routing
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});
