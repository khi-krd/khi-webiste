"use client";

import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import type { ContactOffice, OfficeId } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

export type OfficeCardCopy = {
	name: string;
	nameLatin: string;
	subtitle?: string;
	address: string;
	badgeLabel: string;
	addressLabel: string;
	phoneLabel: string;
	emailLabel: string;
	selectLabel: string;
};

type ContactOfficeCardProps = {
	office: ContactOffice;
	copy: OfficeCardCopy;
	isSelected: boolean;
	onSelect: (id: OfficeId) => void;
	className?: string;
};

export function ContactOfficeCard({
	office,
	copy,
	isSelected,
	onSelect,
	className,
}: ContactOfficeCardProps) {
	const displayIndex = String(office.index).padStart(2, "0");

	return (
		<button
			type="button"
			onClick={() => onSelect(office.id)}
			aria-pressed={isSelected}
			aria-label={`${copy.selectLabel}: ${copy.name}`}
			className={cn(
				"group relative w-full overflow-hidden text-start transition-colors duration-300",
				isSelected ? "bg-sunken/45" : "bg-surface fine-hover:bg-sunken/20",
				className,
			)}
		>
			<span
				className="pointer-events-none absolute end-5 top-5 select-none font-heading text-[clamp(2.75rem,7vw,5rem)] font-extralight leading-none tabular-nums text-foreground/10 sm:end-6 sm:top-6"
				aria-hidden
			>
				{displayIndex}
			</span>

			<div className="relative z-1 p-6 sm:p-8 lg:p-10">
				<div className="flex flex-wrap items-center gap-2.5">
					<Badge variant="outline" size="sm">
						{copy.badgeLabel}
					</Badge>
					{isSelected ? (
						<span className="label font-medium text-foreground">
							{copy.selectLabel}
						</span>
					) : null}
				</div>

				<h3 className="mt-4 font-heading text-h2 font-bold leading-[1.1] text-balance text-foreground">
					{copy.name}
				</h3>
				<p className="label mt-2 font-medium text-muted">{copy.nameLatin}</p>
				{copy.subtitle ? (
					<p className="mt-3 text-body leading-relaxed text-foreground/80">
						{copy.subtitle}
					</p>
				) : null}

				<div className="relative mt-6 aspect-[16/10] overflow-hidden border border-border sm:mt-7">
					<NextImage
						src={office.image.url}
						alt={office.image.alt ?? copy.name}
						fill
						sizes="(max-width: 1024px) 100vw, 45vw"
						className="object-cover brightness-[0.88] contrast-[1.05] saturate-[0.68] transition-[filter,transform] duration-700 ease-out group-fine:scale-[1.02] group-fine:saturate-[0.78] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
					/>
				</div>

				<dl className="mt-8 divide-y divide-border">
					<div className="grid gap-2 py-4 text-start first:pt-0 sm:grid-cols-[6rem_1fr] sm:gap-6">
						<dt className="label font-medium">{copy.addressLabel}</dt>
						<dd className="text-body leading-relaxed text-foreground">
							{copy.address}
						</dd>
					</div>
					<div className="grid gap-2 py-4 text-start sm:grid-cols-[6rem_1fr] sm:gap-6">
						<dt className="label font-medium">{copy.phoneLabel}</dt>
						<dd>
							<a
								href={`tel:${office.phone.replace(/\s/g, "")}`}
								dir="ltr"
								className="text-body text-foreground underline decoration-border underline-offset-4 transition-colors fine-hover:decoration-foreground"
								onClick={(event) => event.stopPropagation()}
							>
								{office.phone}
							</a>
						</dd>
					</div>
					<div className="grid gap-2 py-4 text-start sm:grid-cols-[6rem_1fr] sm:gap-6">
						<dt className="label font-medium">{copy.emailLabel}</dt>
						<dd>
							<a
								href={`mailto:${office.email}`}
								dir="ltr"
								className="text-body text-foreground underline decoration-border underline-offset-4 transition-colors fine-hover:decoration-foreground"
								onClick={(event) => event.stopPropagation()}
							>
								{office.email}
							</a>
						</dd>
					</div>
				</dl>
			</div>
		</button>
	);
}
