import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), TanStackRouterVite(), tsconfigPaths()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			
		},
	},
	server: {
		port: 32200,
		host: "0.0.0.0", // Listen on all network interfaces
		watch: {
			usePolling: true, // Better HMR support in Docker
			interval: 100, // Polling interval in ms
			binaryInterval: 300, // Binary file polling interval
		},
		// Proper HMR configuration
		hmr: {
			protocol: "ws",
			host: "localhost",
			port: 32200,
			clientPort: 32200, // Important for Docker
			overlay: true, // Show errors as overlay
		},
		proxy: {
			"/api": {
			  target: "http://localhost:32550",
			  changeOrigin: true,
			  secure: false,
			},
			"/inference": {
				target: "http://localhost:32100",
				changeOrigin: true,
				secure: false,
			},
			"/media": {
				target: "http://localhost:32400",
				changeOrigin: true,
				secure: false,
			},
		}, 
	},
	// Add build options for production
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
				},
			},
		},
	},
});
