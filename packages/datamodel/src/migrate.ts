import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up two levels from src/ to the package root
const packageRoot = path.resolve(__dirname, "..", "..");

// Construct the path to the drizzle config file relative to the package root
const configPath = path.join(packageRoot, "drizzle.config.ts");

console.log("=== Running Database Migrations from graphcap-datamodel ===");
console.log(`Using config: ${configPath}`);

try {
	// We use execSync to run the command.
	// The DATABASE_URL should already be loaded by src/env.ts when drizzle.config.ts is imported by drizzle-kit
	execSync(`bunx drizzle-kit migrate --config=${configPath}`, {
		stdio: "inherit", // Show output in the console
		cwd: packageRoot, // Run the command from the package root
	});
	console.log("Database migrations completed successfully.");
	process.exit(0); // Success
} catch (error) {
	console.error("Error: Failed to migrate schema changes.");
	// console.error(error); // Optionally log the full error
	process.exit(1); // Failure
}
