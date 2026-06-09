import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import { showcaseGridClass } from "@/components/dev/ui-playground/shared";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export async function SpinnerSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="spinner"
			title={t("sections.spinner.title")}
			description={t("sections.spinner.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.spinner.title")}>
				<div className="flex flex-wrap items-end gap-8">
					<Spinner size="sm" label={t("sections.spinner.title")} />
					<Spinner size="md" label={t("sections.spinner.title")} />
					<Spinner size="lg" label={t("sections.spinner.title")} />
				</div>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function EmptyStateSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="emptyState"
			title={t("sections.emptyState.title")}
			description={t("sections.emptyState.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("emptyState.withoutAction")}>
					<EmptyState
						icon={<MagnifyingGlassIcon />}
						title={t("emptyState.title")}
						description={t("emptyState.description")}
					/>
				</ShowcaseCard>
				<ShowcaseCard title={t("emptyState.withAction")}>
					<EmptyState
						icon={<MagnifyingGlassIcon />}
						title={t("emptyState.title")}
						description={t("emptyState.description")}
					>
						<Button variant="secondary">{t("emptyState.clearFilters")}</Button>
					</EmptyState>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function ErrorStateSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="errorState"
			title={t("sections.errorState.title")}
			description={t("sections.errorState.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.errorState.title")}>
				<ErrorState
					title={t("errorState.title")}
					description={t("errorState.description")}
					framed
					action={<Button variant="secondary">{t("errorState.retry")}</Button>}
				/>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function SkeletonSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="skeleton"
			title={t("sections.skeleton.title")}
			description={t("sections.skeleton.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("skeleton.text")}>
					<SkeletonText lines={4} />
				</ShowcaseCard>
				<ShowcaseCard title={t("skeleton.image")}>
					<Skeleton aspectRatio="16/9" className="w-full" />
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}
