// SPDX-License-Identifier: Apache-2.0
import type { IconButtonProps, ButtonProps } from "@chakra-ui/react";
import { Button, IconButton } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { useClipboard } from '@/common/hooks/useClipboard';
import { Tooltip } from '@/components/ui/tooltip';
import * as React from "react";

export interface ClipboardButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * Text content to be copied to clipboard
   */
  content: string | Record<string, any>;
  /**
   * Label text for button tooltip
   */
  label?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Size of the button
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Variant of the button
   */
  variant?: 'ghost' | 'outline' | 'solid';
  /**
   * Color scheme of the button
   */
  colorPalette?: string;
  /**
   * Show button text or just icon
   */
  iconOnly?: boolean;
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * ClipboardButton component
 * 
 * A button that copies text to clipboard when clicked and shows feedback
 */
export const ClipboardButton = React.forwardRef<
  HTMLButtonElement,
  ClipboardButtonProps
>(function ClipboardButton({
  content,
  label = 'Copy to clipboard',
  className = '',
  size = 'sm',
  variant = 'ghost',
  colorPalette = 'gray',
  iconOnly = false,
  debug = true,
  ...props
}, ref) {
  const { copyToClipboard, hasCopied, error } = useClipboard({ successDuration: 2000 });

  const handleCopy = () => {
    // Handle different content types
    const textToCopy = typeof content === 'string'
      ? content
      : JSON.stringify(content, null, 2);
    
    if (debug) {
      console.log('[ClipboardButton] Attempting to copy text:', 
        textToCopy.length > 100 ? `${textToCopy.substring(0, 100)}... (${textToCopy.length} chars)` : textToCopy
      );
    }
    
    copyToClipboard(textToCopy)
      .then(() => {
        if (debug) console.log('[ClipboardButton] Copy successful');
      })
      .catch(err => {
        console.error('[ClipboardButton] Copy failed:', err);
      });
  };

  // Log errors in debug mode
  React.useEffect(() => {
    if (error && debug) {
      console.error('[ClipboardButton] Clipboard error:', error);
    }
  }, [error, debug]);

  // Visual feedback colors
  const successColor = useColorModeValue('green.500', 'green.300');

  // Set tooltip content based on state
  const tooltipContent = hasCopied 
    ? 'Copied!' 
    : error 
      ? 'Failed to copy' 
      : label;

  // Icon elements
  const copyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
  
  const checkIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  if (iconOnly) {
    return (
      <Tooltip content={tooltipContent} showArrow>
        <IconButton
          size={size}
          variant={variant}
          colorPalette={hasCopied ? 'green' : error ? 'red' : colorPalette}
          onClick={handleCopy}
          className={className}
          aria-label={label}
          ref={ref}
          {...props}
        >
          {hasCopied ? checkIcon : copyIcon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent} showArrow>
      <Button
        size={size}
        variant={variant}
        colorPalette={hasCopied ? 'green' : error ? 'red' : colorPalette}
        onClick={handleCopy}
        className={className}
        aria-label={label}
        ref={ref}
        {...props}
      >
        {hasCopied ? checkIcon : copyIcon}
        <span style={{ marginLeft: '8px' }}>{hasCopied ? 'Copied' : 'Copy'}</span>
      </Button>
    </Tooltip>
  );
}); 