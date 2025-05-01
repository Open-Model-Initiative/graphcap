// SPDX-License-Identifier: Apache-2.0
// ProviderConfig Feature – Route Handlers (v2 pattern)
//
// CRUD handlers for provider configurations following the same style as
// `persons/person.handlers.ts` but with extra logic to encrypt/decrypt API keys.

import { dbClient } from "@graphcap/datamodel";
import { decryptApiKey, encryptApiKey } from "@graphcap/lib";
import type { AppRouteHandler } from "@graphcap/lib-backend";
import { notFoundSchema } from "@graphcap/lib-backend";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { providers as ProvidersTable } from "@graphcap/datamodel";

import { processApiKeyForUpdate } from "./api-key-manager";
import type {
    CreateProviderRoute,
    GetProviderRoute,
    ListProvidersRoute,
    PatchProviderRoute,
    RemoveProviderRoute,
} from "./provider.routes";
import type { InsertProvider, PatchProvider } from "./provider.schema";

// ---------------------------------------------------------------------------
// Helper to decrypt the apiKey field before returning the record
// ---------------------------------------------------------------------------
async function decryptProvider(provider: unknown) {
  const record = provider as { apiKey: string | null };
  if (record && record.apiKey) {
    record.apiKey = await decryptApiKey(record.apiKey);
  }
  return record;
}

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export const listProviders: AppRouteHandler<ListProvidersRoute> = async (c) => {
  // Use query API with relations to include models
  const providers = await dbClient.query.providers.findMany({
    with: {
      models: true,
      rateLimits: true,
    },
  });
  
  // Decrypt keys in parallel
  const decrypted = await Promise.all(providers.map((provider) => decryptProvider(provider)));
  return c.json(decrypted, HttpStatusCodes.OK);
};

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export const createProvider: AppRouteHandler<CreateProviderRoute> = async (c) => {
  const data = c.req.valid("json") as InsertProvider;

  // Encrypt apiKey if provided
  const recordToInsert = { ...data } as InsertProvider & { apiKey?: string | null };
  if (recordToInsert.apiKey) {
    recordToInsert.apiKey = await encryptApiKey(recordToInsert.apiKey);
  }

  const [newItem] = await dbClient
    .insert(ProvidersTable)
    .values(recordToInsert)
    .returning();

  const decrypted = await decryptProvider(newItem);
  return c.json(decrypted, HttpStatusCodes.CREATED);
};

// ---------------------------------------------------------------------------
// GET ONE
// ---------------------------------------------------------------------------
export const getProvider: AppRouteHandler<GetProviderRoute> = async (c) => {
  const { id } = c.req.valid("param");
  
  // Use query API with relations to include models
  const item = await dbClient.query.providers.findFirst({
    where: eq(ProvidersTable.id, id),
    with: {
      models: true,
      rateLimits: true,
    },
  });

  if (!item) {
    return c.json(notFoundSchema, HttpStatusCodes.NOT_FOUND);
  }

  const decrypted = await decryptProvider(item);
  return c.json(decrypted, HttpStatusCodes.OK);
};

// ---------------------------------------------------------------------------
// PATCH (partial update)
// ---------------------------------------------------------------------------
export const patchProvider: AppRouteHandler<PatchProviderRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json") as PatchProvider;

  // Ensure record exists
  const [existing] = await dbClient
    .select()
    .from(ProvidersTable)
    .where(eq(ProvidersTable.id, id))
    .limit(1);

  if (!existing) {
    return c.json(notFoundSchema, HttpStatusCodes.NOT_FOUND);
  }

  if (Object.keys(updates).length === 0) {
    // No updates – return current
    const decrypted = await decryptProvider(existing);
    return c.json(decrypted, HttpStatusCodes.OK);
  }

  // Handle apiKey encryption logic
  let encryptedApiKey: string | null | undefined = undefined;
  if (Object.prototype.hasOwnProperty.call(updates, "apiKey")) {
    encryptedApiKey = await processApiKeyForUpdate({ apiKey: existing.apiKey }, updates.apiKey as string | null | undefined);
  }

  const updatePayload = { ...updates } as Partial<PatchProvider & { apiKey: string | null }>;
  if (encryptedApiKey !== undefined) {
    // processApiKeyForUpdate returns string|null – include even if null to clear key
    updatePayload.apiKey = encryptedApiKey;
  }

  const [updated] = await dbClient
    .update(ProvidersTable)
    .set(updatePayload)
    .where(eq(ProvidersTable.id, id))
    .returning();

  const decrypted = await decryptProvider(updated);
  return c.json(decrypted, HttpStatusCodes.OK);
};

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export const removeProvider: AppRouteHandler<RemoveProviderRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const [deletedItem] = await dbClient
    .delete(ProvidersTable)
    .where(eq(ProvidersTable.id, id))
    .returning({ id: ProvidersTable.id });

  if (!deletedItem) {
    return c.json(notFoundSchema, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
}; 