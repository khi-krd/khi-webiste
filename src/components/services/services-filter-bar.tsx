"use client";

import {
	AdjustmentsHorizontalIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { servicesHref } from "@/lib/services-url";
import { cn } from "@/lib/utils";

type ServicesFilterBarProps = {
	types: string[];
	activeType?: string | null;
	activeQuery?: string | null;
	className?: string;
};

function ClearAllButton({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="font-heading text-label font-medium text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground"
		>
			{label}
		</button>
	);
}

export function ServicesFilterBar({
	types,
	activeType,
	activeQuery,
	className,
}: ServicesFilterBarProps) {
	const t = useTranslations("Services");
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasActiveFilters = Boolean(activeType || activeQuery?.trim());

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	const pushFilters = useCallback(
		(type: string | null, q: string) => {
			startTransition(() => {
				router.replace(servicesHref({ type, q }), { scroll: false });
			});
		},
		[router],
	);

	const handleTypeChange = (value: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(value || null, query);
	};

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (debounceRef.current) clearTimeout(debounceRef.current);
		pushFilters(activeType ?? null, query);
	};

	const handleQueryChange = (value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			pushFilters(activeType ?? null, value);
		}, 350);
	};

	const handleClearSearch = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		pushFilters(activeType ?? null, "");
	};

	const handleClearAll = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		setQuery("");
		router.replace(servicesHref({}), { scroll: false });
	};

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	return (
		<div
			className={cn(
				"border border-border bg-surface transition-opacity",
				isPending && "opacity-80",
				className,
			)}
		>
			<search className="border-b border-border bg-background px-4 py-4 sm:px-5 sm:py-5">
				<form
					onSubmit={handleSearchSubmit}
					className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
				>
					<div
						className={cn(
							"flex h-12 min-w-0 flex-1 items-stretch border border-border-strong bg-surface",
							"transition-colors focus-within:border-foreground",
						)}
					>
						<span className="flex shrink-0 items-center border-e border-border-strong px-3 text-muted sm:px-4">
							<MagnifyingGlassIcon className="size-5" aria-hidden />
						</span>

						<input
							type="search"
							name="q"
							value={query}
							onChange={(event) => handleQueryChange(event.target.value)}
							placeholder={t("search.placeholder")}
							aria-label={t("search.label")}
							autoComplete="off"
							className="h-full min-w-0 flex-1 bg-transparent px-3 py-0 text-body text-foreground placeholder:text-muted focus:outline-none sm:px-4"
						/>

						{query ? (
							<button
								type="button"
								onClick={handleClearSearch}
								className="flex shrink-0 items-center px-3 text-muted transition-colors fine-hover:text-foreground"
								aria-label={t("search.clear")}
							>
								<XMarkIcon className="size-4" aria-hidden />
							</button>
						) : null}
					</div>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						className="h-12 shrink-0 sm:min-w-32"
						disabled={isPending}
					>
						{t("search.submit")}
					</Button>
				</form>
			</search>

			{types.length > 0 || hasActiveFilters ? (
				<div className="px-4 py-4 sm:px-5 sm:py-5">
					{/* No published types means no value could ever be validated, so
					    the dropdown is withheld rather than offering a dead facet. */}
					{types.length > 0 ? (
						<>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-2 text-muted">
									<AdjustmentsHorizontalIcon
										className="size-4 shrink-0"
										aria-hidden
									/>
									<label
										htmlFor="services-type-select"
										className="font-heading text-label font-semibold uppercase tracking-[0.14em]"
									>
										{t("filter.label")}
									</label>
								</div>

								{hasActiveFilters ? (
									<ClearAllButton
										label={t("filter.clear")}
										onClick={handleClearAll}
									/>
								) : null}
							</div>

							<div className="mt-4 max-w-xs">
								<Select
									id="services-type-select"
									value={activeType ?? ""}
									onChange={(event) => handleTypeChange(event.target.value)}
								>
									<option value="">{t("filter.typeAll")}</option>
									{types.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</Select>
							</div>
						</>
					) : null}

					{hasActiveFilters ? (
						<div
							className={cn(
								"flex flex-wrap items-center justify-between gap-3",
								types.length > 0 && "mt-4 border-t border-border pt-4",
							)}
						>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-label text-muted">
									{t("filter.active")}
								</span>
								{activeType ? (
									<Badge variant="outline" size="sm">
										{activeType}
									</Badge>
								) : null}
								{activeQuery?.trim() ? (
									<Badge variant="outline" size="sm">
										&ldquo;{activeQuery}&rdquo;
									</Badge>
								) : null}
							</div>

							{types.length === 0 ? (
								<ClearAllButton
									label={t("filter.clear")}
									onClick={handleClearAll}
								/>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
