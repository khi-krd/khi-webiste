import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactExperience } from "@/components/contact/contact-experience";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactSocial } from "@/components/contact/contact-social";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getContactOffices } from "@/lib/api/contact";
import { getSocialPlatformsFromApi } from "@/lib/api/social";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Contact" });

	return {
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
	const [offices, socialPlatforms] = await Promise.all([
		getContactOffices(locale),
		getSocialPlatformsFromApi(),
	]);

	return (
		<main>
			<VisuallyHidden as="h1">{t("pageTitle")}</VisuallyHidden>

			<ContactHero
				label={t("hero.label")}
				title={locale === "ckb" ? t("hero.titleArabic") : t("hero.titleLatin")}
				tagline={t("hero.tagline")}
			/>

			<ContactExperience
				offices={offices}
				officesEyebrow={t("offices.eyebrow")}
				officesHeading={t("offices.heading")}
				officesDescription={t("offices.description")}
				selectLabel={t("offices.selectLabel")}
				fieldLabels={{
					address: t("offices.fields.address"),
					phone: t("offices.fields.phone"),
					email: t("offices.fields.email"),
				}}
				badgeLabels={{
					hq: t("offices.badge.hq"),
					regional: t("offices.badge.regional"),
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
				}}
			/>

			<ContactSocial
				eyebrow={t("social.eyebrow")}
				heading={t("social.heading")}
				platforms={socialPlatforms}
				getPlatformCopy={(id) => ({
					name: t(`social.platforms.${id}.name`),
					handle: t(`social.platforms.${id}.handle`),
				})}
			/>

			<ContactForm
				locale={locale}
				copy={{
					eyebrow: t("form.eyebrow"),
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
