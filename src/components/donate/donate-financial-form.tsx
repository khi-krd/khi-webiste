"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
	AmountPreset,
	CurrencyId,
	PaymentMethodId,
} from "@/lib/mock/donate";
import {
	createDonateFinancialFormSchema,
	type DonateFinancialFormValues,
} from "@/lib/schemas/donate-financial-form";
import { cn } from "@/lib/utils";

type CurrencyOption = { id: CurrencyId; label: string };

type PaymentMethodCopy = {
	id: PaymentMethodId;
	label: string;
	hint: string;
};

type DonateFinancialFormCopy = {
	heading: string;
	description?: string;
	stepLabel?: string;
	fields: {
		amount: string;
		donorName: string;
		suggestedAmounts: string;
		paymentMethod: string;
	};
	placeholders: {
		amount: string;
		donorName: string;
	};
	currencies: CurrencyOption[];
	amountPresets: { id: AmountPreset["id"]; label: string; value: number }[];
	paymentMethods: PaymentMethodCopy[];
	notice: string;
	submit: string;
	success: { title: string; body: string };
	errors: {
		amountRequired: string;
		amountInvalid: string;
		donorNameRequired: string;
		paymentMethodRequired: string;
	};
};

type DonateFinancialFormProps = {
	copy: DonateFinancialFormCopy;
	className?: string;
};

export function DonateFinancialForm({
	copy,
	className,
}: DonateFinancialFormProps) {
	const [submitted, setSubmitted] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<
		AmountPreset["id"] | null
	>(null);

	const schema = useMemo(
		() =>
			createDonateFinancialFormSchema({
				amountRequired: copy.errors.amountRequired,
				amountInvalid: copy.errors.amountInvalid,
				donorNameRequired: copy.errors.donorNameRequired,
				paymentMethodRequired: copy.errors.paymentMethodRequired,
			}),
		[copy.errors],
	);

	const {
		register,
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<DonateFinancialFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			amount: Number.NaN,
			currency: "iqd",
			donorName: "",
			paymentMethod: "",
		},
	});

	const amountRegister = register("amount", {
		valueAsNumber: true,
	});

	const onSubmit = handleSubmit(async () => {
		await new Promise((resolve) => setTimeout(resolve, 400));
		setSubmitted(true);
	});

	const handlePresetClick = (preset: (typeof copy.amountPresets)[number]) => {
		setSelectedPreset(preset.id);
		setValue("amount", preset.value, { shouldValidate: true });
	};

	return (
		<section
			id="financial-form"
			className={cn("scroll-mt-28", className)}
			aria-labelledby="financial-form-heading"
		>
			<header className="mb-6 max-w-2xl text-start sm:mb-8">
				{copy.stepLabel ? (
					<p className="label font-medium">{copy.stepLabel}</p>
				) : null}
				<h3
					id="financial-form-heading"
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
								label={copy.fields.amount}
								error={errors.amount?.message}
								required
							>
								{(props) => (
									<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
										<Input
											{...props}
											{...amountRegister}
											onChange={(event) => {
												setSelectedPreset(null);
												amountRegister.onChange(event);
											}}
											type="number"
											min={1}
											step={1}
											placeholder={copy.placeholders.amount}
										/>
										<Select
											{...register("currency")}
											defaultValue="iqd"
											className="sm:min-w-28"
											aria-label={copy.fields.amount}
										>
											{copy.currencies.map((currency) => (
												<option key={currency.id} value={currency.id}>
													{currency.label}
												</option>
											))}
										</Select>
									</div>
								)}
							</Field>
						</div>

						<div className="sm:col-span-2">
							<Field
								label={copy.fields.donorName}
								error={errors.donorName?.message}
								required
							>
								{(props) => (
									<Input
										{...props}
										{...register("donorName")}
										placeholder={copy.placeholders.donorName}
									/>
								)}
							</Field>
						</div>

						<div className="sm:col-span-2">
							<p className="text-small font-medium text-foreground">
								{copy.fields.suggestedAmounts}
							</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{copy.amountPresets.map((preset) => (
									<Button
										key={preset.id}
										type="button"
										variant={
											selectedPreset === preset.id ? "primary" : "secondary"
										}
										size="md"
										onClick={() => handlePresetClick(preset)}
									>
										{preset.label}
									</Button>
								))}
							</div>
						</div>

						<div className="sm:col-span-2">
							<p className="text-small font-medium text-foreground">
								{copy.fields.paymentMethod}
								<span aria-hidden className="text-muted">
									{" *"}
								</span>
							</p>
							{errors.paymentMethod?.message ? (
								<p role="alert" className="mt-1 text-small text-foreground">
									{errors.paymentMethod.message}
								</p>
							) : null}
							<Controller
								name="paymentMethod"
								control={control}
								render={({ field }) => (
									<fieldset className="mt-2 grid gap-3 border-0 p-0 sm:grid-cols-2">
										<legend className="sr-only">
											{copy.fields.paymentMethod}
										</legend>
										{copy.paymentMethods.map((method) => {
											const selected = field.value === method.id;
											return (
												<button
													key={method.id}
													type="button"
													aria-pressed={selected}
													onClick={() => field.onChange(method.id)}
													className={cn(
														"border p-4 text-start transition-colors duration-300",
														selected
															? "border-border-strong bg-sunken"
															: "border-border bg-background fine-hover:bg-sunken/20",
													)}
												>
													<p className="font-heading text-h3 font-semibold text-foreground">
														{method.label}
													</p>
													<p className="mt-1 text-small text-muted">
														{method.hint}
													</p>
												</button>
											);
										})}
									</fieldset>
								)}
							/>
						</div>

						<div className="sm:col-span-2">
							<p className="text-small leading-relaxed text-muted">
								{copy.notice}
							</p>
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
