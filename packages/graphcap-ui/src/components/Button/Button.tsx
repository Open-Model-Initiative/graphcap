import { cn } from "@graphcap/ui/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps, forwardRef } from "react";

export const buttonStyles = cva(
  [
    "w-full",
    "rounded-md",
    "font-semibold",
    "focus:outline-none",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        solid: "",
        outline: "border-2",
        ghost: "transition-colors duration-300",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2 aspect-square flex items-center justify-center",
      },
      colorscheme: {
        primary: "text-primary-foreground",
        secondary: "text-secondary-foreground",
        accent: "text-accent-foreground",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        colorscheme: "primary",
        className: "bg-primary-500 hover:bg-primary-600 active:bg-primary-700",
      },
      {
        variant: "outline",
        colorscheme: "primary",
        className:
          "text-primary-600 border-primary-500 bg-transparent hover:bg-primary-100",
      },
      {
        variant: "ghost",
        colorscheme: "primary",
        className: "text-primary-600 bg-transparent hover:bg-primary-100",
      },
      {
        variant: "solid",
        colorscheme: "secondary",
        className:
          "bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700",
      },
      {
        variant: "outline",
        colorscheme: "secondary",
        className:
          "text-secondary-600 border-secondary-500 bg-transparent hover:bg-secondary-100",
      },
      {
        variant: "ghost",
        colorscheme: "secondary",
        className: "text-secondary-600 bg-transparent hover:bg-secondary-100",
      },
      {
        variant: "solid",
        colorscheme: "accent",
        className: "bg-accent-500 hover:bg-accent-600 active:bg-accent-700",
      },
      {
        variant: "outline",
        colorscheme: "accent",
        className:
          "text-accent-600 border-accent-500 bg-transparent hover:bg-accent-100",
      },
      {
        variant: "ghost",
        colorscheme: "accent",
        className: "text-accent-600 bg-transparent hover:bg-accent-100",
      },
      {
        size: "icon",
        className: "w-auto",
      },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      colorscheme: "primary",
    },
  }
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonStyles>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, colorscheme, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size, colorscheme, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
