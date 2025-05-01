// SPDX-License-Identifier: Apache-2.0
// ProviderConfig Feature – OpenAPI Route Definitions (v2 pattern)

import { notFoundSchema } from "@graphcap/lib-backend";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema, createErrorSchema } from "stoker/openapi/schemas";

import {
    insertProviderSchema,
    patchProviderSchema,
    selectProviderSchema,
} from "./provider.schema";

const tags = ["Providers"];

// ----------------------------------------------------------------------------
// LIST
// ----------------------------------------------------------------------------
export const listProviders = createRoute({
  path: "/",
  method: "get",
  tags,
  summary: "List all provider configurations",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProviderSchema),
      "A list of providers",
    ),
  },
});

// ----------------------------------------------------------------------------
// CREATE
// ----------------------------------------------------------------------------
export const createProvider = createRoute({
  path: "/",
  method: "post",
  tags,
  summary: "Create a new provider configuration",
  request: {
    body: jsonContentRequired(insertProviderSchema, "The provider data to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(selectProviderSchema, "The newly created provider"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProviderSchema),
      "Validation errors for the provided provider data",
    ),
  },
});

// ----------------------------------------------------------------------------
// GET ONE
// ----------------------------------------------------------------------------
export const getProvider = createRoute({
  path: "/{id}",
  method: "get",
  tags,
  summary: "Get a single provider configuration by ID",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProviderSchema, "The requested provider"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Provider with the specified ID not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID format provided",
    ),
  },
});

// ----------------------------------------------------------------------------
// PATCH (partial update)
// ----------------------------------------------------------------------------
export const patchProvider = createRoute({
  path: "/{id}",
  method: "patch",
  tags,
  summary: "Update an existing provider configuration",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchProviderSchema, "The provider updates to apply"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProviderSchema, "The updated provider"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Provider with the specified ID not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchProviderSchema).or(createErrorSchema(IdParamsSchema)),
      "Validation errors for the provided update data or ID",
    ),
  },
});

// ----------------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------------
export const removeProvider = createRoute({
  path: "/{id}",
  method: "delete",
  tags,
  summary: "Delete a provider configuration by ID",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Provider deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Provider with the specified ID not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID format provided",
    ),
  },
});

export type ListProvidersRoute = typeof listProviders;
export type CreateProviderRoute = typeof createProvider;
export type GetProviderRoute = typeof getProvider;
export type PatchProviderRoute = typeof patchProvider;
export type RemoveProviderRoute = typeof removeProvider; 