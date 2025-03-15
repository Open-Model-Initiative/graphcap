// SPDX-License-Identifier: Apache-2.0
import { IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonProps {
  readonly direction: 'prev' | 'next';
  readonly 'aria-label'?: string;
  readonly onClick?: () => void;
  readonly 'aria-disabled'?: boolean;
  readonly className?: string;
}

/**
 * A navigation button component for carousel navigation
 */
export function NavigationButton({
  direction,
  'aria-label': ariaLabel,
  onClick,
  'aria-disabled': ariaDisabled,
  className,
}: NavigationButtonProps) {
  const defaultAriaLabel = direction === 'prev' ? 'Previous' : 'Next';

  return (
    <IconButton
      aria-label={ariaLabel ?? defaultAriaLabel}
      variant="ghost"
      colorScheme="gray"
      rounded="full"
      size="lg"
      onClick={onClick}
      disabled={ariaDisabled}
      className={className}
    >
      {direction === 'prev' ? <ChevronLeft /> : <ChevronRight />}
    </IconButton>
  );
} 