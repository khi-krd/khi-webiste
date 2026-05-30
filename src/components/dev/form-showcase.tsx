"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FormShowcase() {
	const t = useTranslations("Ui.form");
	const [showError, setShowError] = useState(false);

	return (
		<div className="grid gap-8 sm:grid-cols-2">
			<Field label={t("emailLabel")} description={t("emailDescription")}>
				{(props) => (
					<Input {...props} type="email" placeholder={t("emailPlaceholder")} />
				)}
			</Field>

			<Field label={t("messageLabel")} required>
				{(props) => (
					<Textarea {...props} placeholder={t("messagePlaceholder")} rows={3} />
				)}
			</Field>

			<div className="sm:col-span-2">
				<Field
					label={t("usernameLabel")}
					description={t("usernameDescription")}
					error={showError ? t("usernameError") : undefined}
					required
				>
					{(props) => <Input {...props} defaultValue={t("usernameDefault")} />}
				</Field>
			</div>

			<div className="sm:col-span-2">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => setShowError((v) => !v)}
				>
					{showError ? t("clearError") : t("showError")}
				</Button>
			</div>
		</div>
	);
}
