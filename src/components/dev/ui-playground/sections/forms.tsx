import { getTranslations } from "next-intl/server";
import { FormShowcase } from "@/components/dev/form-showcase";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import { showcaseGridClass } from "@/components/dev/ui-playground/shared";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export async function InputSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="input"
			title={t("sections.input.title")}
			description={t("sections.input.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("inputs.default")}>
					<div className="grid gap-4">
						<Input placeholder={t("inputs.defaultPlaceholder")} />
						<Input defaultValue={t("inputs.withValueSample")} />
						<Textarea placeholder={t("inputs.textareaPlaceholder")} rows={3} />
					</div>
				</ShowcaseCard>
				<ShowcaseCard title={t("inputs.overlayHint")}>
					<div className="grid gap-4 bg-foreground p-5 [&_p]:text-primary-foreground/60">
						<Input
							variant="overlay"
							placeholder={t("inputs.overlayPlaceholder")}
						/>
						<Input
							variant="overlay"
							fieldSize="lg"
							placeholder={t("inputs.overlayPlaceholder")}
						/>
						<Input
							variant="overlay"
							fieldSize="lg"
							defaultValue={t("inputs.invalidSample")}
							aria-invalid
						/>
					</div>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function FieldSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="field"
			title={t("sections.field.title")}
			description={t("sections.field.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.field.title")}>
				<FormShowcase />
			</ShowcaseCard>
		</PlaygroundSection>
	);
}
