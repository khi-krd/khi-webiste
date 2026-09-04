"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

/** Re-runs the server render — the platform may just have been waking up. */
export function RetryButton({ label }: { label: string }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	return (
		<Button
			variant="secondary"
			disabled={pending}
			leadingIcon={
				<ArrowPathIcon className={pending ? "animate-spin" : undefined} />
			}
			onClick={() => {
				startTransition(() => {
					router.refresh();
				});
			}}
		>
			{label}
		</Button>
	);
}
