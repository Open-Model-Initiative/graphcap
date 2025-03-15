// SPDX-License-Identifier: Apache-2.0
/**
 * Encryption Service
 * 
 * This service provides encryption and decryption functionality for sensitive data
 * such as API keys using AES encryption.
 */

import CryptoJS from 'crypto-js';

/**
 * Service for encrypting and decrypting sensitive data
 */
export class EncryptionService {
  private readonly secretKey: string;

  /**
   * Creates a new EncryptionService instance
   * 
   * @throws Error if ENCRYPTION_KEY environment variable is not set
   */
  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.secretKey = key;
  }

  /**
   * Encrypts a plain text string
   * 
   * @param text - The text to encrypt
   * @returns The encrypted text
   */
  encrypt(text: string): string {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  /**
   * Decrypts an encrypted text string
   * 
   * @param encryptedText - The encrypted text to decrypt
   * @returns The decrypted text
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// Export a singleton instance of the encryption service
export const encryptionService = new EncryptionService(); 