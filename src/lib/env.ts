import "server-only";

/**
 * Startup validation for deploy-time configuration.
 *
 * Without this the app fails *open*: `getApiBaseUrl()` returns null when
 * `API_BASE_URL` is unset, every CMS fetch resolves to null, and the site boots
 * successfully while serving empty pages. Likewise an unset
 * `NEXT_PUBLIC_SITE_URL` leaves `metadataBase` undefined and makes
 * `sitemap.ts` return an empty array — a silently un-indexable deploy.
 *
 * Called once from the root layout so a misconfigured container crashes on the
 * first request instead of quietly serving a broken site.
 *
 * Deliberately hand-rolled rather than zod: this module is imported from the
 * layout, and value-importing a `z.object()` schema drags zod into bundles that
 * do not otherwise need it.
 */

type EnvProblem = { variable: string; message: string };

function validate(): EnvProblem[] {
	const problems: EnvProblem[] = [];

	// There is no mock catalogue to fall back on any more: without the backend
	// URL every CMS fetch returns null and the site renders empty states.
	if (!process.env.API_BASE_URL?.trim()) {
		problems.push({
			variable: "API_BASE_URL",
			message:
				"Required: the backend REST API base URL. Without it every CMS fetch returns null and the site renders empty.",
		});
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
	if (!siteUrl) {
		problems.push({
			variable: "NEXT_PUBLIC_SITE_URL",
			message:
				"Required: the canonical public origin (e.g. https://khi.example). Drives metadataBase, canonical URLs, hreflang and sitemap.xml.",
		});
	} else {
		try {
			const parsed = new URL(siteUrl);
			if (parsed.protocol !== "https:") {
				problems.push({
					variable: "NEXT_PUBLIC_SITE_URL",
					message: `Must be https in production (got "${parsed.protocol}//"). Canonical URLs and OG tags would advertise an insecure origin.`,
				});
			}
		} catch {
			problems.push({
				variable: "NEXT_PUBLIC_SITE_URL",
				message: `Not a valid absolute URL: "${siteUrl}".`,
			});
		}
	}

	return problems;
}

function warn(): void {
	const revalidateSeconds = Number.parseInt(
		process.env.API_REVALIDATE_SECONDS ?? process.env.REVALIDATE_SECONDS ?? "0",
		10,
	);
	if (revalidateSeconds > 0 && !process.env.REVALIDATION_SECRET?.trim()) {
		console.warn(
			"[env] ISR is enabled (API_REVALIDATE_SECONDS > 0) but REVALIDATION_SECRET is unset, " +
				"so POST /api/revalidate is disabled. Published CMS changes will not appear until the TTL expires.",
		);
	}
}

let checked = false;

/**
 * Throws in production when required configuration is missing. In development
 * it only warns, so `pnpm dev` still starts against a partial `.env.local`.
 */
export function assertServerEnv(): void {
	if (checked) {
		return;
	}
	checked = true;

	// `next build` runs this layout while prerendering. The Dockerfile only
	// passes NEXT_PUBLIC_* as build args — server secrets like API_BASE_URL are
	// supplied at container run time — so throwing here would break the image
	// build. Runtime is the correct place to enforce these.
	if (process.env.NEXT_PHASE === "phase-production-build") {
		return;
	}

	const problems = validate();
	warn();

	if (problems.length === 0) {
		return;
	}

	const report = problems
		.map((problem) => `  - ${problem.variable}: ${problem.message}`)
		.join("\n");

	if (process.env.NODE_ENV === "production") {
		throw new Error(
			`Invalid environment configuration:\n${report}\n\nSee .env.example for the full list.`,
		);
	}

	console.warn(
		`[env] Incomplete configuration (this would be fatal in production):\n${report}`,
	);
}
