// SPDX-License-Identifier: Apache-2.0
/**
 * API Key Manager
 * 
 * This module handles API key encryption, decryption, and management operations.
 */

import { decryptApiKey, encryptApiKey, logger } from "@graphcap/lib";
import type { SelectProvider as Provider } from "./provider.schema";

// Simple type for objects with an optional API key property
export type WithApiKey = {
  apiKey: string | null | undefined;
};

/**
 * Processes an API key for update operations
 * Determines if we should use existing key, encrypt a new key, or clear the key
 */
export const processApiKeyForUpdate = async (
  currentProvider: WithApiKey, 
  newApiKeyValue: string | undefined | null
): Promise<string | null> => {
  // CASE 1: Keep existing key if no new value provided
  if (newApiKeyValue === undefined) {
    logger.debug("Keeping existing API key - no change requested");
    return currentProvider.apiKey ?? null;
  }
  
  // CASE 2: Explicitly clear the key
  if (newApiKeyValue === null || newApiKeyValue === "") {
    logger.debug("API key explicitly cleared in update");
    return null;
  }
  
  // CASE 3: Encrypt new key value
  logger.debug("Encrypting new API key for provider update");
  const encryptedKey = await encryptApiKey(newApiKeyValue);
  logger.debug("API key encrypted for update");
  return encryptedKey;
};

/**
 * Safely decrypts a provider's API key for client response
 */
export const decryptProviderApiKey = async (
  provider: Provider
): Promise<Provider> => {
  const providerCopy = { ...provider };
  
  if (providerCopy.apiKey) {
    logger.debug({ 
      providerId: provider.id,
      encryptedKeyLength: providerCopy.apiKey.length 
    }, "Decrypting API key for provider");
    
    providerCopy.apiKey = await decryptApiKey(providerCopy.apiKey);
    
    // Log the result of decryption (without showing the actual key)
    logger.debug({ 
      providerId: provider.id,
      apiKeyPresent: Boolean(providerCopy.apiKey),
      apiKeyLength: providerCopy.apiKey ? providerCopy.apiKey.length : 0
    }, "Provider API key decryption result");
  } else {
    logger.debug({ providerId: provider.id }, "No API key to decrypt for provider");
  }
  
  return providerCopy;
}; 