import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { z } from "zod";

import { createRouter } from "@graphcap/lib-backend";

// Define the route configurations
const indexRoute = createRoute({
  tags: ["Index"],
  method: "get",
  path: "/",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("GraphCap Data Service API"),
      "GraphCap Data Service API Index"
    ),
  },
});

const healthRoute = createRoute({
  tags: ["Health"],
  method: "get",
  path: "/health",
  description: "Health check endpoint to verify the API is running",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        status: z.string(),
        service: z.string(),
        version: z.string(),
        timestamp: z.string(),
      }),
      "API is healthy and responding"
    ),
  },
});

// Create the router with the routes
const router = createRouter()
  .openapi(indexRoute, (async (c) => {
    return c.json(
      {
        message: "GraphCap Data Service API",
      },
      HttpStatusCodes.OK
    );
  }))
  .openapi(healthRoute, (async (c) => {
    return c.json(
      {
        status: "ok",
        service: "graphcap-data-service",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      },
      HttpStatusCodes.OK
    );
  }));

export default router;
