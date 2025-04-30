import { describe, expect, test, vi } from 'vitest';
import { decryptApiKey, encryptApiKey } from '../src/util/encryption';

// Mock the environment configuration
vi.mock('../src/config/env', () => ({
  default: {
    ENCRYPTION_KEY: 'test-encryption-key-for-unit-tests'
  }
}));

describe('Encryption Utilities', () => {
  describe('encryptApiKey', () => {
    test('should encrypt a valid API key', async () => {
      // GIVEN a valid API key
      const apiKey = 'test-api-key-123';
      
      // WHEN the API key is encrypted
      const encrypted = await encryptApiKey(apiKey);
      
      // THEN it should return an encrypted string that is not the original value
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toEqual(apiKey);
      expect(typeof encrypted).toBe('string');
    });
    
    test('should return an empty string when provided with an empty input', async () => {
      // GIVEN an empty API key
      const emptyApiKey = '';
      
      // WHEN the empty API key is encrypted
      const result = await encryptApiKey(emptyApiKey);
      
      // THEN it should return an empty string
      expect(result).toBe('');
    });
    
    test('should encrypt different API keys to different encrypted values', async () => {
      // GIVEN two different API keys
      const apiKey1 = 'test-api-key-1';
      const apiKey2 = 'test-api-key-2';
      
      // WHEN both API keys are encrypted
      const encrypted1 = await encryptApiKey(apiKey1);
      const encrypted2 = await encryptApiKey(apiKey2);
      
      // THEN the encrypted values should be different
      expect(encrypted1).not.toEqual(encrypted2);
    });
  });
  
  describe('decryptApiKey', () => {
    test('should correctly decrypt an encrypted API key', async () => {
      // GIVEN a valid API key that has been encrypted
      const originalApiKey = 'test-api-key-456';
      const encryptedApiKey = await encryptApiKey(originalApiKey);
      
      // WHEN the encrypted API key is decrypted
      const decrypted = await decryptApiKey(encryptedApiKey);
      
      // THEN it should match the original API key
      expect(decrypted).toEqual(originalApiKey);
    });
    
    test('should return an empty string when provided with an empty input', async () => {
      // GIVEN an empty encrypted API key
      const emptyEncryptedApiKey = '';
      
      // WHEN the empty encrypted API key is decrypted
      const result = await decryptApiKey(emptyEncryptedApiKey);
      
      // THEN it should return an empty string
      expect(result).toBe('');
    });
    
    test('should return an empty string when trying to decrypt an invalid encrypted value', async () => {
      // GIVEN an invalid encrypted API key
      const invalidEncryptedApiKey = 'not-a-valid-encrypted-value';
      
      // WHEN the invalid encrypted API key is decrypted
      const result = await decryptApiKey(invalidEncryptedApiKey);
      
      // THEN it should return an empty string
      expect(result).toBe('');
    });
  });
  
  describe('Encryption-Decryption workflow', () => {
    test('should correctly encrypt and decrypt back to the original value', async () => {
      // GIVEN a set of API keys with different characteristics
      const testCases = [
        'simple-api-key',
        'API-KEY-WITH-UPPERCASE',
        'api_key_with_underscores',
        'api-key-123-with-numbers',
        'api.key.with.dots',
        'a'.repeat(100), // very long key
        '!@#$%^&*()_+{}|:<>?', // special characters
      ];
      
      for (const originalApiKey of testCases) {
        // WHEN the API key is encrypted and then decrypted
        const encrypted = await encryptApiKey(originalApiKey);
        const decrypted = await decryptApiKey(encrypted);
        
        // THEN the decrypted value should match the original
        expect(decrypted).toEqual(originalApiKey);
      }
    });
  });
});
