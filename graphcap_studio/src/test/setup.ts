// SPDX-License-Identifier: Apache-2.0
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { imageServiceMock } from './mocks/servicesMock';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock modules
vi.mock('@/services/images', () => {
  return {
    ...imageServiceMock,
    // Add any specific Image type or constants needed
    Image: undefined, // This will be replaced by the interface in tests
  };
});