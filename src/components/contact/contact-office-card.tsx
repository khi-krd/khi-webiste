import NextImage from "next/image";
import type { ContactOffice } from "@/lib/mock/contact";
import { cn } from "@/lib/utils";

export type OfficeCardCopy = {
	name: string;
	nameLatin: string;
	subtitle?: string;
	address: string;
	workingHours?: string;
	addressLabel: string;
	workingHoursLabel: string;
	phoneLabel: string;
	emailLabel: string;
};

type ContactOfficeCardProps = {
	office: ContactOffice;
	copy: OfficeCardCopy;
	className?: string;
};

/** One label/value row of the office details list. */
function DetailRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="grid gap-1 py-4 text-start sm:grid-cols-[7rem_1fr] sm:gap-6">
			<dt className="label font-medium text-muted">{label}</dt>
			<dd className="text-body leading-relaxed text-foreground">{children}</dd>
		</div>
	);
}

/**
 * A phone number or address is read left-to-right even in a Sorani page, and a
 * green underline marks it as the one tappable thing in an otherwise static
 * card — the card itself is no longer a control (see `contact-experience`).
 */
const contactLinkClass =
	"text-body text-foreground underline decoration-border underline-offset-4 transition-colors fine-hover:text-brand fine-hover:decoration-brand";

export function ContactOfficeCard({
	office,
	copy,
	className,
}: ContactOfficeCardProps) {
	return (
		// `group` + `group-fine` so the whole card reacts as one object, and only
		// on real pointers — a sticky :hover after a tap would leave a phone
		// looking permanently hovered.
		<article
			className={cn(
				"group relative bg-surface transition-colors duration-500 fine-hover:bg-sunken/25",
				className,
			)}
		>
			{/* Brand-green rule that wipes out from the centre. origin-center, not
			    origin-left/right: the page is RTL in Sorani and LTR in Kurmanji, and
			    a centred wipe needs no direction at all. */}
			<span
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 z-1 h-0.5 origin-center scale-x-0 bg-brand transition-transform duration-500 ease-out group-fine:scale-x-100 motion-reduce:transition-none"
			/>

			<div className="relative aspect-[16/10] overflow-hidden border-b border-border">
				<NextImage
					src={office.image.url}
					alt={office.image.alt ?? copy.name}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover brightness-[0.94] saturate-[0.82] transition-[transform,filter] duration-700 ease-out group-fine:scale-[1.04] group-fine:brightness-100 group-fine:saturate-100 motion-reduce:transition-none motion-reduce:group-fine:scale-100"
				/>
			</div>

			<div className="p-6 sm:p-8 lg:p-10">
				<h3 className="font-heading text-h2 font-bold leading-[1.12] text-balance text-foreground transition-colors duration-300 group-fine:text-brand">
					{copy.name}
				</h3>
				<p className="label mt-2 font-medium text-muted">{copy.nameLatin}</p>
				{copy.subtitle ? (
					<p className="mt-4 max-w-prose text-body leading-relaxed text-foreground/80">
						{copy.subtitle}
					</p>
				) : null}

				<dl className="mt-7 divide-y divide-border border-t border-border sm:mt-8">
					<DetailRow label={copy.addressLabel}>{copy.address}</DetailRow>

					{copy.workingHours ? (
						<DetailRow label={copy.workingHoursLabel}>
							{copy.workingHours}
						</DetailRow>
					) : null}

					<DetailRow label={copy.phoneLabel}>
						<span className="flex flex-col items-start gap-1">
							<a
								href={`tel:${office.phone.replace(/\s/g, "")}`}
								dir="ltr"
								className={contactLinkClass}
							>
								{office.phone}
							</a>
							{office.secondaryPhone ? (
								<a
									href={`tel:${office.secondaryPhone.replace(/\s/g, "")}`}
									dir="ltr"
									className={contactLinkClass}
								>
									{office.secondaryPhone}
								</a>
							) : null}
						</span>
					</DetailRow>

					<DetailRow label={copy.emailLabel}>
						<a
							href={`mailto:${office.email}`}
							dir="ltr"
							className={contactLinkClass}
						>
							{office.email}
						</a>
					</DetailRow>
				</dl>
			</div>
		</article>
	);
}
