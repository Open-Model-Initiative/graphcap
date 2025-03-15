// SPDX-License-Identifier: Apache-2.0
/**
 * Encryption Utilities
 * 
 * Utilities for encrypting and decrypting sensitive data.
 */

import CryptoJS from 'crypto-js';
import { env } from '../env';

/**
 * Encrypts an API key using AES encryption
 * 
 * @param apiKey - The API key to encrypt
 * @returns The encrypted API key
 */
export const encryptApiKey = async (apiKey: string): Promise<string> => {
  if (!apiKey) return '';
  
  return CryptoJS.AES.encrypt(
    apiKey,
    env.ENCRYPTION_KEY
  ).toString();
};

/**
 * Decrypts an encrypted API key
 * 
 * @param encryptedApiKey - The encrypted API key to decrypt
 * @returns The decrypted API key
 */
export const decryptApiKey = async (encryptedApiKey: string): Promise<string> => {
  if (!encryptedApiKey) return '';
  
  const bytes = CryptoJS.AES.decrypt(
    encryptedApiKey,
    env.ENCRYPTION_KEY
  );
  
  return bytes.toString(CryptoJS.enc.Utf8);
}; 