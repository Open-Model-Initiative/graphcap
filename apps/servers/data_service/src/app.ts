// SPDX-License-Identifier: Apache-2.0
/**
 * GraphCap Data Service App
 * 
 * Main Hono application setup with middleware and routes.
 */

import { configureOpenAPI, createApp } from "@graphcap/lib-backend";
import { cors } from "hono/cors";
import providerRouter from './features/provider_config/provider.index';
import indexRoute from './routes/index.route';

// Define API prefix
const API_PREFIX = '/api';

// Create OpenAPI Hono app
const app = createApp();
configureOpenAPI(app, "GraphCap Data Service API", "1.0.0");

// Add middleware
app.use(`${API_PREFIX}/*`, cors());

// API routes with v1 prefix
const api = app
  .route("/api", indexRoute)
  .route("/api/providers", providerRouter);

// --- Export the type of the chained routes ---
export type AppType = typeof api;

export default app;
