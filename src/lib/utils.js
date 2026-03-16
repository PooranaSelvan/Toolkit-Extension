import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  try {
    return twMerge(clsx(inputs));
  } catch {
    // Fallback: join non-falsy strings with spaces
    return inputs.filter(Boolean).join(' ');
  }
}
