import { ServiceSection } from "@/components/services/service-section";
import { ServicesSectionNav } from "@/components/services/services-section-nav";
import type { ServiceItem } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

type ServiceSectionCopy = {
	service: ServiceItem;
	title: string;
	body: string;
};

type NavItem = {
	id: string;
	title: string;
};

type ServicesShellProps = {
	sections: ServiceSectionCopy[];
	navItems: NavItem[];
	navLabel: string;
	className?: string;
};

export function ServicesShell({
	sections,
	navItems,
	navLabel,
	className,
}: ServicesShellProps) {
	return (
		<div
			id="services"
			className={cn(
				// The 2xl padding pulls the nav rail and sections onto the centered
				// 96rem canvas (columns carry their own inner padding); equals 0 at
				// exactly 1536px so nothing shifts below the breakpoint.
				"grid w-full bg-background lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:gap-14 2xl:px-[calc((100vw-var(--canvas))/2)]",
				className,
			)}
		>
			<div className="lg:sticky lg:top-28 lg:flex lg:h-[calc(100dvh-7rem)] lg:items-center lg:self-start lg:px-6 xl:px-10">
				<ServicesSectionNav items={navItems} navLabel={navLabel} />
			</div>

			<div className="min-w-0">
				{sections.map(({ service, title, body }, index) => (
					<ServiceSection
						key={service.id}
						service={service}
						title={title}
						body={body}
						index={index}
					/>
				))}
			</div>
		</div>
	);
}
