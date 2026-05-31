"use client";

import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

/**
 * Route-level loading UI (Suspense fallback during navigation / streaming).
 *
 * Client leaf BY NECESSITY: loading.tsx receives no `params`, so the server
 * `getTranslations()` would read dynamic request state and opt the whole
 * segment out of static rendering (SEO priority). `useTranslations` instead
 * reads the already-provided NextIntlClientProvider context, keeping the route
 * statically prerendered while still localizing the label.
 */
export default function Loading() {
	const t = useTranslations("Common");

	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Spinner size="lg" label={t("loading")} />
		</div>
	);
}
