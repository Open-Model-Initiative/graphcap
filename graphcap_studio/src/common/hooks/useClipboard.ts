// SPDX-License-Identifier: Apache-2.0
/**
 * useClipboard Hook
 * 
 * A hook for managing clipboard operations with feedback.
 * Includes fallback mechanisms for different platforms.
 */

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  /**
   * Duration in milliseconds to show success state
   */
  successDuration?: number;
  /**
   * Enable debug logging
   */
  debug?: boolean;
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

/**
 * Checks if navigator.clipboard API is available
 */
const isClipboardAPIAvailable = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' && 
    navigator.clipboard && 
    typeof navigator.clipboard.writeText === 'function'
  );
};

/**
 * Fallback method using document.execCommand
 * @param text Text to copy
 */
const copyWithExecCommand = (text: string): boolean => {
  // Create a temporary textarea element
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  // Execute the copy command
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('execCommand error:', err);
  }
  
  // Clean up
  document.body.removeChild(textArea);
  return success;
};

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardResult {
  const { successDuration = 2000, debug = false } = options;
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    if (debug) {
      console.log('[useClipboard] Starting copy operation');
      console.log('[useClipboard] Clipboard API available:', isClipboardAPIAvailable());
    }

    try {
      // First try the modern Clipboard API
      if (isClipboardAPIAvailable()) {
        if (debug) console.log('[useClipboard] Using Clipboard API');
        await navigator.clipboard.writeText(text);
      } 
      // If that fails or isn't available, try the fallback
      else {
        if (debug) console.log('[useClipboard] Falling back to execCommand');
        const success = copyWithExecCommand(text);
        if (!success) {
          throw new Error('execCommand copy failed');
        }
      }
      
      // Success handling
      if (debug) console.log('[useClipboard] Copy successful');
      setHasCopied(true);
      setError(null);
      
      // Reset success state after duration
      setTimeout(() => {
        setHasCopied(false);
      }, successDuration);
    } catch (err) {
      if (debug) {
        console.error('[useClipboard] Copy failed:', err);
        console.error('[useClipboard] Navigator:', typeof navigator);
        console.error('[useClipboard] Clipboard:', typeof navigator !== 'undefined' ? typeof navigator.clipboard : 'N/A');
      }
      
      setError(err instanceof Error ? err : new Error('Failed to copy to clipboard'));
      setHasCopied(false);

      // Try one last fallback method for macOS
      try {
        if (debug) console.log('[useClipboard] Attempting final fallback');
        
        // Create a clickable element to trigger user action
        const button = document.createElement('button');
        button.textContent = 'Copy to clipboard';
        button.style.display = 'none';
        document.body.appendChild(button);
        
        button.onclick = async () => {
          try {
            await navigator.clipboard.writeText(text);
            setHasCopied(true);
            setError(null);
            
            if (debug) console.log('[useClipboard] Final fallback successful');
            
            setTimeout(() => {
              setHasCopied(false);
            }, successDuration);
          } catch (finalErr) {
            if (debug) console.error('[useClipboard] Final fallback failed:', finalErr);
          }
          
          document.body.removeChild(button);
        };
        
        // Simulate a click to trigger the copy in user context
        button.click();
      } catch (fallbackErr) {
        if (debug) console.error('[useClipboard] All fallback methods failed:', fallbackErr);
      }
    }
  }, [successDuration, debug]);

  return {
    copyToClipboard,
    hasCopied,
    error
  };
} 