import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Short function used for conditional CSS class assembly.
 *
 * See https://www.npmjs.com/package/clsx for
 * examples on conditional classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
