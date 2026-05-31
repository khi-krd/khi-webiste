"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Route error boundary. MUST be a client component (Next requirement). The
 * presentation (ErrorState) is a shared component; this leaf only wires the
 * retry action to the boundary's `reset()`.
 */
export default function ErrorBoundary({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("ErrorBoundary");

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
			<ErrorState
				title={t("title")}
				description={t("description")}
				framed
				action={
					<Button variant="secondary" onClick={reset}>
						{t("retry")}
					</Button>
				}
			/>
		</div>
	);
}
