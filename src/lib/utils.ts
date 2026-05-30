export type ClassValue = string | false | null | undefined;

/**
 * Minimal class-name joiner. Filters out falsy values so conditional classes
 * read cleanly: cn("base", isActive && "active", className). No external dep —
 * we don't need clsx/tailwind-merge for this small token-driven system.
 */
export function cn(...inputs: ClassValue[]): string {
	return inputs.filter(Boolean).join(" ");
}
