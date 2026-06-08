import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { getServiceLayoutComponent } from "@/components/services/layouts";
import { ServicesReveal } from "@/components/services/services-motion";
import type { ServiceItem } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

type ServiceSectionProps = {
	service: ServiceItem;
	title: string;
	body: string;
	index?: number;
	className?: string;
};

export function ServiceSection({
	service,
	title,
	body,
	index = 0,
	className,
}: ServiceSectionProps) {
	const Layout = getServiceLayoutComponent(service.layout);

	return (
		<section
			id={service.id}
			className={cn("scroll-mt-36 sm:scroll-mt-40 lg:scroll-mt-36", className)}
			aria-labelledby={`${service.id}-heading`}
		>
			<AboutSection bordered>
				<AboutShell>
					<ServicesReveal delay={Math.min(index * 0.06, 0.24)}>
						<Layout service={service} title={title} body={body} />
					</ServicesReveal>
				</AboutShell>
			</AboutSection>
		</section>
	);
}
