import type { CSSProperties } from "react";
import { AnnounceLoading } from "@/components/search/search-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 2 / 3 / 3 / 4 columns → 6 / 6 / 9 / 12 plates fill a clean rectangle. */
const PLATE_GHOSTS = 12;

function plateVisibility(index: number): string | undefined {
	if (index >= 9) {
		return "hidden 2xl:block";
	}
	if (index >= 6) {
		return "hidden lg:block";
	}
	return undefined;
}

/**
 * Streaming placeholder while the first page of results renders — the exact
 * geometry of the results shell (chip row, toolbar, results column first,
 * sidebar ghost second) so nothing jumps when the real thing lands. Cards
 * rise in with the same stagger as the plates: the first paint is alive too.
 */
export function ResultsSkeleton({ label }: { label: string }) {
	return (
		<div role="status" aria-label={label}>
			<AnnounceLoading />
			<div aria-hidden>
				{/* Row C — kind chips */}
				<div className="flex items-center gap-2 overflow-hidden">
					{Array.from({ length: 5 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
						<Skeleton key={i} className="h-11 w-24 shrink-0 lg:h-10" />
					))}
				</div>

				<div className="mt-5 sm:mt-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12">
					{/* Results column (first in the DOM, second in the grid) */}
					<div className="min-w-0 lg:col-start-2 lg:row-start-1">
						{/* Row D — toolbar: summary line, then (below sm) its own row of
						    refine toggle + sort, exactly like the real thing stacks. */}
						<div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
							<Skeleton className="h-7 w-56 max-w-[60%]" />
							<div className="flex items-center gap-2 sm:gap-3">
								<Skeleton className="h-11 flex-1 sm:w-28 sm:flex-none lg:hidden" />
								<Skeleton className="h-11 w-32 shrink-0 lg:h-10" />
							</div>
						</div>

						{/* Plate grid */}
						<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5 2xl:grid-cols-4">
							{Array.from({ length: PLATE_GHOSTS }, (_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
									key={i}
									className={cn(
										"search-rise border border-border bg-surface",
										plateVisibility(i),
									)}
									style={{ "--i": i } as CSSProperties}
								>
									<Skeleton aspectRatio="4/3" className="w-full" />
									<div className="flex flex-col gap-2.5 p-3 sm:p-4 2xl:px-5">
										<Skeleton className="h-3 w-2/5" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
									</div>
									<Skeleton className="h-7 w-full" />
								</div>
							))}
						</div>
					</div>

					{/* Refine sidebar ghost */}
					<div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
						<Skeleton className="h-5 w-28" />
						<div className="mt-5 flex flex-col gap-4">
							{Array.from({ length: 3 }, (_, group) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
								<div key={group} className="flex flex-col gap-3">
									<Skeleton className="h-10 w-full" />
									{Array.from({ length: 3 }, (_, row) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
										<Skeleton key={row} className="h-4 w-4/5" />
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PlateGhost({ index }: { index: number }) {
	return (
		<div
			className="search-rise border border-border bg-surface"
			style={{ "--i": index } as CSSProperties}
		>
			<Skeleton aspectRatio="4/3" className="w-full" />
			<div className="flex flex-col gap-2.5 p-3 sm:p-4 2xl:px-5">
				<Skeleton className="h-3 w-2/5" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
			<Skeleton className="h-7 w-full" />
		</div>
	);
}

/**
 * Placeholder for the mixed overview: summary line, the source jump strip,
 * then a platform block (two kind rows of four plates) and a website block
 * (two catalogues of three rows) — the geometry the real thing lands in.
 */
export function OverviewSkeleton({ label }: { label: string }) {
	return (
		<div role="status" aria-label={label}>
			<AnnounceLoading />
			<div aria-hidden>
				<div className="border-b border-border pb-3">
					<Skeleton className="h-7 w-80 max-w-[70%]" />
				</div>
				<div className="mt-4 flex flex-wrap gap-2">
					{Array.from({ length: 3 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
						<Skeleton key={i} className="h-11 w-32 lg:h-10" />
					))}
				</div>

				<div className="mt-8 flex flex-col gap-12 sm:mt-10 sm:gap-14">
					<div>
						<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground pb-3">
							<div className="min-w-0 flex-1">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="mt-2 h-4 w-72 max-w-full" />
							</div>
							<Skeleton className="h-10 w-44 shrink-0 basis-full sm:basis-auto" />
						</div>
						<div className="mt-6 flex flex-col gap-8 sm:gap-10">
							{Array.from({ length: 2 }, (_, row) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
								<div key={row}>
									<Skeleton className="h-5 w-32" />
									<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5">
										{Array.from({ length: 4 }, (_, i) => (
											<PlateGhost
												// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
												key={i}
												index={row * 4 + i}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground pb-3">
							<div className="min-w-0 flex-1">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="mt-2 h-4 w-64 max-w-full" />
							</div>
							<Skeleton className="h-10 w-44 shrink-0 basis-full sm:basis-auto" />
						</div>
						<div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-x-14">
							{Array.from({ length: 2 }, (_, column) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
								<div key={column}>
									<Skeleton className="h-5 w-40" />
									{Array.from({ length: 3 }, (_, i) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
											key={i}
											className="mt-3 flex items-center gap-4 border-b border-border pb-3"
										>
											<Skeleton className="h-15 w-20 shrink-0" />
											<div className="min-w-0 flex-1">
												<Skeleton className="h-4 w-4/5" />
												<Skeleton className="mt-2 h-3.5 w-3/5" />
											</div>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
