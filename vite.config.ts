// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind the HTTP server to localhost:5173
    host: "localhost",
    port: 5173,
    strictPort: true,
    // Explicitly configure HMR so the browser will try ws://localhost:5173/ for hot‐reload
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});
