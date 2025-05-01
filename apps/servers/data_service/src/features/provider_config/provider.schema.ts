// SPDX-License-Identifier: Apache-2.0
// ProviderConfig Feature – Schema Definitions (v2 pattern)
//
// This module exposes OpenAPI-ready Zod schemas that map directly to the
// `providers` table in the datamodel package.  It follows the same structure as
// `persons/person.schema.ts` so that the handlers & routes can rely on strong
// typing generated from the database source-of-truth.

import { providers as ProvidersTable } from "@graphcap/datamodel";
import { registerSchema } from "@graphcap/lib-backend";
import type { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ---------------------------------------------------------------------------
// SELECT (output) schema
// ---------------------------------------------------------------------------
const selectProviderSchemaRaw = createSelectSchema(ProvidersTable);

/**
 * Schema representing a full Provider record returned by the API.
 */
export const selectProviderSchema = registerSchema(
	"Provider",
	selectProviderSchemaRaw,
	"Represents a provider configuration stored in the system.",
);

export type SelectProvider = z.infer<typeof selectProviderSchema>;

// ---------------------------------------------------------------------------
// INSERT (create) schema
// ---------------------------------------------------------------------------
const insertProviderBase = createInsertSchema(ProvidersTable);

// For creation we omit auto-generated columns and keep everything else
const insertProviderObjectSchema = insertProviderBase.pick({
	name: true,
	kind: true,
	environment: true,
	baseUrl: true,
	apiKey: true,
	isEnabled: true,
});

export const insertProviderSchema = registerSchema(
	"CreateProviderInput",
	insertProviderObjectSchema,
	"Schema for creating a new provider configuration.",
);

export type InsertProvider = z.infer<typeof insertProviderSchema>;

// ---------------------------------------------------------------------------
// PATCH (update) schema – all fields optional
// ---------------------------------------------------------------------------
const patchProviderObjectSchema = insertProviderObjectSchema.partial();

export const patchProviderSchema = registerSchema(
	"UpdateProviderInput",
	patchProviderObjectSchema,
	"Schema for partially updating an existing provider configuration.",
);

export type PatchProvider = z.infer<typeof patchProviderSchema>;
