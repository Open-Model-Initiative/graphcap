import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "../config/env";

export function pinoLogger() {
	if (!env) {
		throw new Error("env is not provided");
	}
	return logger({
		pino: pino(
			{
				level: env.LOG_LEVEL ?? "info",
				redact: ["req.headers.cookie"],
			},
			env.NODE_ENV === "production" ? undefined : pretty(),
		),
	});
}
