import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    // Avoid adding custom Content-Type in headers—Vite sets it per file. Forcing
    // "application/javascript" for all responses breaks index.html (raw HTML in browser).
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // ✅ Enable SPA fallback for all routes (Vite does this automatically via middleware)
  appType: "spa",
}));
