import "server-only";
import { z } from "zod";

/**
 * Validated server-side environment. Import this instead of touching
 * `process.env` directly so a misconfigured deploy fails fast and loudly.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time and safe to read in
 * client components directly; they are validated here for completeness.
 */
const envSchema = z.object({
	API_BASE_URL: z.url(),
	API_REVALIDATE_SECONDS: z.coerce.number().int().nonnegative().default(3600),
	NEXT_PUBLIC_MEDIA_HOST: z.string().min(1),
	NEXT_PUBLIC_SITE_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(
		`Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
	);
}

export const env = parsed.data;
