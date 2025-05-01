import type { ReactNode } from "react";
import { toast, type ExternalToast } from "sonner";

/**
 * useToast
 * A small wrapper around the `sonner` toast helpers so that consumer apps
 * don't have to depend on `sonner` directly.
 *
 * Example:
 * const { success } = useToast();
 * success("Item created!");
 */
export const useToast = () => {
  type Message = ReactNode;

  const success = (message: Message, options?: ExternalToast) =>
    toast.success(message, options);

  const info = (message: Message, options?: ExternalToast) =>
    toast.info(message, options);

  const error = (message: Message, options?: ExternalToast) =>
    toast.error(message, options);

  /** Generic toast shortcut */
  const trigger = (message: Message, options?: ExternalToast) =>
    toast(message, options);

  return {
    toast: trigger,
    success,
    info,
    error,
  } as const;
};
