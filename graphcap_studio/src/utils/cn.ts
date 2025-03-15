import { clsx, type ClassValue } from "clsx"

/**
 * Utility function to conditionally join class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

