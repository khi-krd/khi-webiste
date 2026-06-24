"use client";

import { Link } from "@/i18n/navigation";
import { projectsHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";

type ProjectsTagBarProps = {
	tags: string[];
	activeYear: string | null;
	activeTag: string | null;
	activeQuery: string | null;
	tagsLabel: string;
};

export function ProjectsTagBar({
	tags,
	activeYear,
	activeTag,
	activeQuery,
	tagsLabel,
}: ProjectsTagBarProps) {
	if (tags.length === 0) return null;

	return (
		<div className="border-b border-border bg-background">
			<div className="mx-auto max-w-[88rem] px-6 py-4 sm:px-8">
				<p className="label font-medium text-muted">{tagsLabel}</p>
				<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
					{tags.map((tag) => (
						<li key={tag}>
							<Link
								href={projectsHref({
									year: activeYear,
									tag: activeTag === tag ? null : tag,
									q: activeQuery,
								})}
								className={cn(
									"text-small transition-colors duration-200",
									activeTag === tag
										? "font-semibold text-foreground underline decoration-border underline-offset-4"
										: "text-muted fine-hover:text-foreground",
								)}
								aria-current={activeTag === tag ? "page" : undefined}
							>
								{tag}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
