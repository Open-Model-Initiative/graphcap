import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@graphcap/web": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tsconfigPaths(), TanStackRouterVite()],
  server: {
    proxy: {
      // Proxy /api requests to the local graphcap-server instance
      "/api": {
        target: "http://localhost:5174",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
