import * as React from "react";

import { cn } from "@graphcap/ui/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  autoGrow?: boolean;
  width?: "sm" | "md" | "lg" | "full"; // Width options
  height?: "sm" | "md" | "lg"; // Height options
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoGrow, width = "full", height = "md", ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = useCombinedRefs(ref, textareaRef);
    const [value, setValue] = React.useState(
      props.value || props.defaultValue || ""
    );

    // Handle auto-growing behavior
    React.useEffect(() => {
      if (!autoGrow || !textareaRef.current) return;

      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to grow with content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [autoGrow, value]);

    // Update internal value when controlled value changes
    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value);
      }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    // Width classes
    const widthClasses = {
      sm: "w-32",
      md: "w-64",
      lg: "w-96",
      full: "w-full",
    };

    // Height classes
    const heightClasses = {
      sm: "min-h-12",
      md: "min-h-16",
      lg: "min-h-32",
    };

    return (
      <textarea
        ref={combinedRef}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          widthClasses[width],
          heightClasses[height],
          autoGrow && "overflow-hidden transition-height duration-200",
          className
        )}
        {...props}
        onChange={handleChange}
      />
    );
  }
);

// Utility for combining refs
function useCombinedRefs<T>(...refs: (React.Ref<T> | null | undefined)[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

Textarea.displayName = "Textarea";

export { Textarea };

