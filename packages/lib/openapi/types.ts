import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Context, Env, Handler, MiddlewareHandler, Schema } from "hono";
import type { PinoLogger } from "hono-pino";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

// biome-ignore lint/complexity/noBannedTypes: Generic setup
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;

// --- Basic JSON Types ---
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| { [key: string]: JsonValue }
	| JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

// Define a generic type for Hono handlers in this application
export type AppEnv = Env & {
	// ... existing code ...
};
