import { TagIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import { showcaseGridClass } from "@/components/dev/ui-playground/shared";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Divider } from "@/components/ui/divider";
import { Pagination } from "@/components/ui/pagination";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export async function VisuallyHiddenSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="visuallyHidden"
			title={t("sections.visuallyHidden.title")}
			description={t("sections.visuallyHidden.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.visuallyHidden.title")}>
				<p className="mb-3 text-small text-muted">{t("visuallyHidden.hint")}</p>
				<VisuallyHidden
					as="a"
					href="#visuallyHidden"
					focusable
					className="focus:z-10 focus:m-1 focus:border focus:border-border-strong focus:bg-surface focus:px-4 focus:py-2 focus:text-small focus:text-foreground"
				>
					{t("visuallyHidden.skipLink")}
				</VisuallyHidden>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function DividerSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="divider"
			title={t("sections.divider.title")}
			description={t("sections.divider.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.divider.title")}>
				<div className="flex max-w-md flex-col gap-6">
					<Divider />
					<Divider>{t("divider.or")}</Divider>
					<div className="flex h-10 items-center gap-3">
						<span className="text-small text-muted">A</span>
						<Divider orientation="vertical" />
						<span className="text-small text-muted">B</span>
					</div>
				</div>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function BadgeSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="badge"
			title={t("sections.badge.title")}
			description={t("sections.badge.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.badge.title")}>
				<div className="flex flex-wrap items-center gap-3">
					<Badge variant="solid">{t("badge.solid")}</Badge>
					<Badge variant="outline">{t("badge.outline")}</Badge>
					<Badge variant="subtle">{t("badge.subtle")}</Badge>
					<Badge variant="outline" leadingIcon={<TagIcon />}>
						{t("badge.withIcon")}
					</Badge>
				</div>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function BreadcrumbSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="breadcrumb"
			title={t("sections.breadcrumb.title")}
			description={t("sections.breadcrumb.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.breadcrumb.title")}>
				<Breadcrumb
					label={t("breadcrumb.label")}
					items={[
						{ label: t("breadcrumb.home"), href: "/" },
						{ label: t("breadcrumb.library"), href: "/" },
						{ label: t("breadcrumb.books"), href: "/" },
						{ label: t("breadcrumb.current") },
					]}
				/>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function PaginationSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="pagination"
			title={t("sections.pagination.title")}
			description={t("sections.pagination.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("pagination.label")}>
					<Pagination
						currentPage={5}
						totalPages={20}
						label={t("pagination.label")}
						previousLabel={t("pagination.previous")}
						nextLabel={t("pagination.next")}
						createHref={(page) => `/ui?page=${page}`}
					/>
				</ShowcaseCard>
				<ShowcaseCard title={t("pagination.next")}>
					<Pagination
						currentPage={2}
						totalPages={7}
						label={t("pagination.label")}
						previousLabel={t("pagination.previous")}
						nextLabel={t("pagination.next")}
						createHref={(page) => `/ui?page=${page}`}
					/>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}
