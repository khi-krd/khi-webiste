import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactExperience } from "@/components/contact/contact-experience";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactHero } from "@/components/contact/contact-hero";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getContactOffices } from "@/lib/api/contact";
import { localeAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Contact" });

	return {
		alternates: localeAlternates(locale, "/contact"),
		title: t("pageTitle"),
		description: t("metaDescription"),
	};
}

export default async function ContactPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("Contact");
	const offices = await getContactOffices(locale);

	return (
		<main>
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<ContactHero title={t("hero.title")} />

			<ContactExperience
				offices={offices}
				officesHeading={t("offices.heading")}
				officesDescription={t("offices.description")}
				fieldLabels={{
					address: t("offices.fields.address"),
					workingHours: t("offices.fields.workingHours"),
					phone: t("offices.fields.phone"),
					email: t("offices.fields.email"),
				}}
				officeCopy={{
					sulaymaniyah: {
						name: t("offices.items.sulaymaniyah.name"),
						nameLatin: t("offices.items.sulaymaniyah.nameLatin"),
						subtitle: t("offices.items.sulaymaniyah.subtitle"),
						address: t("offices.items.sulaymaniyah.address"),
					},
					duhok: {
						name: t("offices.items.duhok.name"),
						nameLatin: t("offices.items.duhok.nameLatin"),
						subtitle: t("offices.items.duhok.subtitle"),
						address: t("offices.items.duhok.address"),
					},
				}}
				mapCopy={{
					heading: t("map.heading"),
					body: t("map.body"),
					openInMaps: t("map.openInMaps"),
					iframeTitle: t("map.iframeTitle"),
					selectOffice: t("map.selectOffice"),
				}}
			/>

			<ContactForm
				locale={locale}
				copy={{
					heading: t("form.heading"),
					description: t("form.description"),
					fields: {
						fullName: t("form.fields.fullName"),
						email: t("form.fields.email"),
						phone: t("form.fields.phone"),
						subject: t("form.fields.subject"),
						message: t("form.fields.message"),
					},
					placeholders: {
						fullName: t("form.placeholders.fullName"),
						email: t("form.placeholders.email"),
						phone: t("form.placeholders.phone"),
						subject: t("form.placeholders.subject"),
						message: t("form.placeholders.message"),
					},
					submit: t("form.submit"),
					success: {
						title: t("form.success.title"),
						body: t("form.success.body"),
					},
					errors: {
						fullNameRequired: t("form.errors.fullNameRequired"),
						emailInvalid: t("form.errors.emailInvalid"),
						subjectRequired: t("form.errors.subjectRequired"),
						messageRequired: t("form.errors.messageRequired"),
						submitFailed: t("form.errors.submitFailed"),
					},
				}}
			/>
		</main>
	);
}
