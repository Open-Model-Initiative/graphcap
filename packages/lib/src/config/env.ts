import path from "node:path";
/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(
	config({
		path: path.resolve(
			process.cwd(),
			process.env.NODE_ENV === "test" ? ".env.test" : ".env",
		),
	}),
);

const EnvSchema = z
	.object({
		NODE_ENV: z.string().default("development"),
		WORKSPACE_DIR: z.string().default("/workspace"),
		LOG_LEVEL: z
			.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
			.default("debug"),
		DATABASE_URL: z.string().url(),
		DATABASE_AUTH_TOKEN: z.string().optional(),
		MEDIA_SERVER_PORT: z.coerce.number().default(59150),
		POSTGRES_HOST: z.string().default("graphcap_postgres"),
		ENCRYPTION_KEY: z.string()
	})
	.superRefine((input, ctx) => {
		if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_type,
				expected: "string",
				received: "undefined",
				path: ["DATABASE_AUTH_TOKEN"],
				message: "Must be set when NODE_ENV is 'production'",
			});
		}
	});

// Export the environment schema type
export type EnvType = z.infer<typeof EnvSchema>;

// Parse the environment
const { data, error } = EnvSchema.safeParse(process.env);

if (error) {
	console.error("❌ Invalid env:");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

if (!data) {
	throw new Error('env is not provided');
}

// Export the parsed environment values
export const env = data;

// For backwards compatibility with code that imports from '@graphcap/lib/env'
export default env;