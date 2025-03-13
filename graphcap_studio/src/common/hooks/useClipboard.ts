// SPDX-License-Identifier: Apache-2.0
/**
 * useClipboard Hook
 * 
 * A hook for managing clipboard operations with feedback.
 */

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  /**
   * Duration in milliseconds to show success state
   */
  successDuration?: number;
}

interface UseClipboardResult {
  /**
   * Copy text to clipboard
   */
  copyToClipboard: (text: string) => Promise<void>;
  /**
   * Whether the last copy operation was successful
   */
  hasCopied: boolean;
  /**
   * Any error that occurred during the last copy operation
   */
  error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardResult {
  const { successDuration = 2000 } = options;
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setError(null);
      
      // Reset success state after duration
      setTimeout(() => {
        setHasCopied(false);
      }, successDuration);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to copy to clipboard'));
      setHasCopied(false);
    }
  }, [successDuration]);

  return {
    copyToClipboard,
    hasCopied,
    error
  };
} 