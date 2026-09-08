import type { CSSProperties } from "react";
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
						{/* Row D — toolbar */}
						<div className="flex items-end justify-between gap-4 border-b border-border pb-3">
							<Skeleton className="h-7 w-56 max-w-[60%]" />
							<Skeleton className="h-11 w-32 shrink-0 lg:h-10" />
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
