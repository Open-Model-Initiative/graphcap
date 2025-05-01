import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "../middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: true,
		defaultHook, // Returns validation errors with zod errors to output
	});
}

export default function createApp(emoji?: string) {
	const app = createRouter();
	app.use(serveEmojiFavicon(emoji ?? "👥"));
	app.use(pinoLogger());

	app.notFound(notFound);
	app.onError(onError);
	return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
	return createApp().route("/", router);
}
