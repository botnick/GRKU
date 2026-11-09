import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind classes merged, the later ones winning, as the shadcn/ui components expect. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
