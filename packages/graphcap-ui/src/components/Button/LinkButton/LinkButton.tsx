import { cn } from "@graphcap/ui/utils";
import { createLink } from "@tanstack/react-router";
import { VariantProps } from "class-variance-authority";
import { ComponentProps, forwardRef } from "react";
import { buttonStyles } from "../Button"; // Import styles from Button.tsx

// Anchor element props + variant props from buttonStyles
export type LinkButtonBaseProps = ComponentProps<"a"> &
  VariantProps<typeof buttonStyles>;

/**
 * Base anchor component that only handles styling.
 * This will be enhanced with `createLink` to gain router awareness.
 */
const LinkButtonBase = forwardRef<HTMLAnchorElement, LinkButtonBaseProps>(
  ({ variant, size, colorscheme, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(buttonStyles({ variant, size, colorscheme, className }))}
        {...props}
      />
    );
  }
);
LinkButtonBase.displayName = "LinkButtonBase";

// Enhance the base anchor with TanStack Router's navigation & type-safety
const LinkButtonCreated = createLink(LinkButtonBase);

export type LinkButtonProps = Parameters<typeof LinkButtonCreated>[0];

// Directly assign the component created by createLink
// We lose the ability to set default `preload='intent'` here easily,
// but it resolves the complex type issues.
// Consumers can add `preload='intent'` manually if needed.
export const LinkButton = LinkButtonCreated; 