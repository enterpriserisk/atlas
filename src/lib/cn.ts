/**
 * Tiny className combiner. Filters falsy values and joins with spaces.
 * Kept dependency-free; for the simple, additive class composition ATLAS needs,
 * later classes in a template already win via source order so no conflict-merge is required.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
