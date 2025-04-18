import { defineConfig } from "drizzle-kit";

import env from "@graphcap/lib/config/env";

if (!env) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	// Add verbose and strict options for better debugging if needed
	// verbose: true,
	// strict: true,
});
