import { Skeleton } from "@/components/ui/skeleton";

/** Streaming placeholder while the first page of results renders. */
export function ResultsSkeleton() {
	return (
		<div aria-hidden>
			{/* Kind tab bar */}
			<div className="flex items-center gap-7 border-b border-border pb-3">
				{Array.from({ length: 5 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
					<Skeleton key={i} className="h-4 w-16" />
				))}
			</div>

			<div className="mt-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
				{/* Refine sidebar */}
				<div className="hidden flex-col gap-3 lg:flex">
					<Skeleton className="h-5 w-24" />
					{Array.from({ length: 8 }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
						<Skeleton key={i} className="h-4 w-full" />
					))}
				</div>

				{/* Result rows */}
				<div className="min-w-0">
					<Skeleton className="h-5 w-52" />
					<div className="mt-5 flex flex-col">
						{Array.from({ length: 5 }, (_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static decorative slots
								key={i}
								className="flex gap-6 border-t border-border py-6 first:border-t-0"
							>
								<Skeleton className="size-22 shrink-0 sm:size-28" />
								<div className="min-w-0 flex-1">
									<Skeleton className="h-3.5 w-32" />
									<Skeleton className="mt-3 h-5 w-4/5" />
									<Skeleton className="mt-3 h-4 w-1/3" />
									<Skeleton className="mt-3 hidden h-4 w-full sm:block" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
