import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DonateFormsSection } from "@/components/donate/donate-forms-section";
import { DonateHero } from "@/components/donate/donate-hero";
import { DonateParticipation } from "@/components/donate/donate-participation";
import { DonateTypesGrid } from "@/components/donate/donate-types-grid";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getDonatePageDataFromApi } from "@/lib/api/donations";
import { getAmountPresets, MATERIAL_TYPE_IDS } from "@/lib/donate/content";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Donate" });

	return {
		alternates: localeAlternates(locale, "/donate"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

export default async function DonatePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Donate");
	const { heroMedia, heroCopy, typeCards, visibility } =
		await getDonatePageDataFromApi(locale);
	const amountPresets = getAmountPresets();

	return (
		<main>
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<DonateHero
				heroMedia={heroMedia}
				title={heroCopy.title ?? t("hero.title")}
				intro={heroCopy.intro ?? t("hero.intro")}
				ctaArchive={t("hero.ctaArchive")}
				ctaFinancial={t("hero.ctaFinancial")}
				showArchiveCta={visibility.archive}
				showFinancialCta={visibility.financial}
			/>

			{/* The editor's cards are the only source. No hardcoded stand-in: an
			    empty donation_type_cards table hides the section rather than showing
			    placeholder stock photos the institute never chose. */}
			{typeCards.length > 0 ? (
				<DonateTypesGrid heading={t("types.heading")} items={typeCards} />
			) : null}

			<DonateParticipation
				heading={t("participate.heading")}
				archive={{
					label: t("participate.paths.archive.label"),
					body: t("participate.paths.archive.body"),
					cta: t("participate.paths.archive.cta"),
				}}
				financial={{
					label: t("participate.paths.financial.label"),
					body: t("participate.paths.financial.body"),
					cta: t("participate.paths.financial.cta"),
				}}
				body={t("participate.body")}
				closing={t("participate.closing")}
				showArchive={visibility.archive}
				showFinancial={visibility.financial}
			/>

			<DonateFormsSection
				showArchive={visibility.archive}
				showFinancial={visibility.financial}
				heading={t("forms.sectionHeading")}
				description={t("forms.sectionDescription")}
				archiveCopy={{
					heading: t("forms.archive.heading"),
					description: t("forms.archive.description"),
					fields: {
						userName: t("forms.archive.fields.userName"),
						registerName: t("forms.archive.fields.registerName"),
						contactNumber: t("forms.archive.fields.contactNumber"),
						materialType: t("forms.archive.fields.materialType"),
						fileUpload: t("forms.archive.fields.fileUpload"),
						note: t("forms.archive.fields.note"),
					},
					placeholders: {
						userName: t("forms.archive.placeholders.userName"),
						registerName: t("forms.archive.placeholders.registerName"),
						contactNumber: t("forms.archive.placeholders.contactNumber"),
						materialType: t("forms.archive.placeholders.materialType"),
						fileUpload: t("forms.archive.placeholders.fileUpload"),
						note: t("forms.archive.placeholders.note"),
					},
					materialOptions: MATERIAL_TYPE_IDS.map((id) => ({
						id,
						label: t(`forms.archive.materialOptions.${id}`),
					})),
					submit: t("forms.archive.submit"),
					success: {
						title: t("forms.archive.success.title"),
						body: t("forms.archive.success.body"),
					},
					errors: {
						userNameRequired: t("forms.archive.errors.userNameRequired"),
						contactRequired: t("forms.archive.errors.contactRequired"),
						materialTypeRequired: t(
							"forms.archive.errors.materialTypeRequired",
						),
						fileTooLarge: t("forms.archive.errors.fileTooLarge"),
						fileInvalidType: t("forms.archive.errors.fileInvalidType"),
						submitFailed: t("forms.archive.errors.submitFailed"),
					},
				}}
				financialCopy={{
					heading: t("forms.financial.heading"),
					description: t("forms.financial.description"),
					fields: {
						amount: t("forms.financial.fields.amount"),
						donorName: t("forms.financial.fields.donorName"),
						suggestedAmounts: t("forms.financial.fields.suggestedAmounts"),
						paymentMethod: t("forms.financial.fields.paymentMethod"),
					},
					placeholders: {
						amount: t("forms.financial.placeholders.amount"),
						donorName: t("forms.financial.placeholders.donorName"),
					},
					currencies: [
						{ id: "iqd", label: t("forms.financial.currencies.iqd") },
						{ id: "usd", label: t("forms.financial.currencies.usd") },
					],
					amountPresets: amountPresets.map((preset) => ({
						id: preset.id,
						value: preset.value,
						label: t(`forms.financial.amountPresets.${preset.id}`),
					})),
					paymentMethods: [
						{
							id: "fib",
							label: t("forms.financial.paymentMethods.fib.label"),
							hint: t("forms.financial.paymentMethods.fib.hint"),
						},
						{
							id: "fastpay",
							label: t("forms.financial.paymentMethods.fastpay.label"),
							hint: t("forms.financial.paymentMethods.fastpay.hint"),
						},
					],
					notice: t("forms.financial.notice"),
					submit: t("forms.financial.submit"),
					success: {
						title: t("forms.financial.success.title"),
						body: t("forms.financial.success.body"),
					},
					errors: {
						amountRequired: t("forms.financial.errors.amountRequired"),
						amountInvalid: t("forms.financial.errors.amountInvalid"),
						donorNameRequired: t("forms.financial.errors.donorNameRequired"),
						paymentMethodRequired: t(
							"forms.financial.errors.paymentMethodRequired",
						),
						submitFailed: t("forms.financial.errors.submitFailed"),
					},
				}}
			/>
		</main>
	);
}
