import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge multiple class names with tailwind-merge
 * This is useful for conditionally applying classes
 * 
 * @example cn("text-red-500", isActive && "font-bold")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 