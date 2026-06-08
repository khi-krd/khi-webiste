"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	createDonateArchiveFormSchema,
	type DonateArchiveFormValues,
} from "@/lib/schemas/donate-archive-form";
import { cn } from "@/lib/utils";

type MaterialOption = {
	id: string;
	label: string;
};

type DonateArchiveFormCopy = {
	heading: string;
	description?: string;
	stepLabel?: string;
	fields: {
		userName: string;
		registerName: string;
		contactNumber: string;
		materialType: string;
		fileUpload: string;
		note: string;
	};
	placeholders: {
		userName: string;
		registerName: string;
		contactNumber: string;
		materialType: string;
		fileUpload: string;
		note: string;
	};
	materialOptions: MaterialOption[];
	submit: string;
	success: { title: string; body: string };
	errors: {
		userNameRequired: string;
		contactRequired: string;
		materialTypeRequired: string;
		fileTooLarge: string;
		fileInvalidType: string;
	};
};

type DonateArchiveFormProps = {
	copy: DonateArchiveFormCopy;
	className?: string;
};

export function DonateArchiveForm({ copy, className }: DonateArchiveFormProps) {
	const [submitted, setSubmitted] = useState(false);

	const schema = useMemo(
		() =>
			createDonateArchiveFormSchema({
				userNameRequired: copy.errors.userNameRequired,
				contactRequired: copy.errors.contactRequired,
				materialTypeRequired: copy.errors.materialTypeRequired,
				fileTooLarge: copy.errors.fileTooLarge,
				fileInvalidType: copy.errors.fileInvalidType,
			}),
		[copy.errors],
	);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<DonateArchiveFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			userName: "",
			registerName: "",
			contactNumber: "",
			materialType: "",
			file: null,
			note: "",
		},
	});

	const onSubmit = handleSubmit(async () => {
		await new Promise((resolve) => setTimeout(resolve, 400));
		setSubmitted(true);
	});

	return (
		<section
			id="archive-form"
			className={cn("scroll-mt-28", className)}
			aria-labelledby="archive-form-heading"
		>
			<header className="mb-6 max-w-2xl text-start sm:mb-8">
				{copy.stepLabel ? (
					<p className="label font-medium">{copy.stepLabel}</p>
				) : null}
				<h3
					id="archive-form-heading"
					className={cn(
						"font-heading text-h2 font-bold leading-[1.12] text-balance",
						copy.stepLabel ? "mt-2" : undefined,
					)}
				>
					{copy.heading}
				</h3>
				{copy.description ? (
					<p className="mt-3 text-body leading-relaxed text-muted">
						{copy.description}
					</p>
				) : null}
			</header>

			<div className="border border-border bg-surface p-6 sm:p-8 lg:p-10">
				{submitted ? (
					<div
						role="status"
						className="flex items-start gap-4 border border-border bg-background p-6 sm:p-8"
					>
						<CheckCircleIcon
							className="mt-0.5 size-6 shrink-0 text-foreground"
							aria-hidden
						/>
						<div>
							<p className="font-heading text-h3 font-semibold text-foreground">
								{copy.success.title}
							</p>
							<p className="mt-2 text-body leading-relaxed text-muted">
								{copy.success.body}
							</p>
						</div>
					</div>
				) : (
					<form
						className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2"
						onSubmit={onSubmit}
						noValidate
					>
						<div className="sm:col-span-2">
							<Field
								label={copy.fields.userName}
								error={errors.userName?.message}
								required
							>
								{(props) => (
									<Input
										{...props}
										{...register("userName")}
										placeholder={copy.placeholders.userName}
									/>
								)}
							</Field>
						</div>

						<Field label={copy.fields.registerName}>
							{(props) => (
								<Input
									{...props}
									{...register("registerName")}
									placeholder={copy.placeholders.registerName}
								/>
							)}
						</Field>

						<Field
							label={copy.fields.contactNumber}
							error={errors.contactNumber?.message}
							required
						>
							{(props) => (
								<Input
									{...props}
									{...register("contactNumber")}
									type="tel"
									placeholder={copy.placeholders.contactNumber}
								/>
							)}
						</Field>

						<div className="sm:col-span-2">
							<Field
								label={copy.fields.materialType}
								error={errors.materialType?.message}
								required
							>
								{(props) => (
									<Select
										{...props}
										{...register("materialType")}
										defaultValue=""
									>
										<option value="" disabled>
											{copy.placeholders.materialType}
										</option>
										{copy.materialOptions.map((option) => (
											<option key={option.id} value={option.id}>
												{option.label}
											</option>
										))}
									</Select>
								)}
							</Field>
						</div>

						<div className="sm:col-span-2">
							<Field
								label={copy.fields.fileUpload}
								error={errors.file?.message as string | undefined}
							>
								{(props) => (
									<Controller
										name="file"
										control={control}
										render={({ field }) => (
											<FileUpload
												{...props}
												placeholder={copy.placeholders.fileUpload}
												value={field.value ?? null}
												onChange={field.onChange}
												accept="image/*,audio/*,video/*,application/pdf"
											/>
										)}
									/>
								)}
							</Field>
						</div>

						<div className="sm:col-span-2">
							<Field label={copy.fields.note}>
								{(props) => (
									<Textarea
										{...props}
										{...register("note")}
										rows={5}
										placeholder={copy.placeholders.note}
									/>
								)}
							</Field>
						</div>

						<div className="sm:col-span-2">
							<Button
								type="submit"
								variant="primary"
								size="lg"
								disabled={isSubmitting}
							>
								{copy.submit}
							</Button>
						</div>
					</form>
				)}
			</div>
		</section>
	);
}
