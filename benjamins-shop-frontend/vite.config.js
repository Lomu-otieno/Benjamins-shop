import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/Benjamins-shop",
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_BASE_PATH,
        changeOrigin: true,
      },
    },
  },
});
