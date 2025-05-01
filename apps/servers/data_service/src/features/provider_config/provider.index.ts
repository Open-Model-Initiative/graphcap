// SPDX-License-Identifier: Apache-2.0
// ProviderConfig Feature – Router (v2 pattern)

import { createRouter } from "@graphcap/lib-backend";

import * as handlers from "./provider.handlers";
import * as routes from "./provider.routes";

/**
 * Router for the Provider Config feature.
 * Mounts all defined routes and their corresponding handlers.
 */
const providerRouter = createRouter()
  .openapi(routes.listProviders, handlers.listProviders)
  .openapi(routes.createProvider, handlers.createProvider)
  .openapi(routes.getProvider, handlers.getProvider)
  .openapi(routes.patchProvider, handlers.patchProvider)
  .openapi(routes.removeProvider, handlers.removeProvider);

export default providerRouter; 