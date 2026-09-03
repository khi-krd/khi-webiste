"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	HomeSection,
	homeSectionContentClass,
	homeSectionHeaderClass,
} from "@/components/contact/contact-shell";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactFormAction } from "@/lib/actions/contact";
import {
	type ContactFormValues,
	createContactFormSchema,
} from "@/lib/schemas/contact-form";

type ContactFormCopy = {
	heading: string;
	description: string;
	fields: {
		fullName: string;
		email: string;
		phone: string;
		subject: string;
		message: string;
	};
	placeholders: {
		fullName: string;
		email: string;
		phone: string;
		subject: string;
		message: string;
	};
	submit: string;
	success: {
		title: string;
		body: string;
	};
	errors: {
		fullNameRequired: string;
		emailInvalid: string;
		subjectRequired: string;
		messageRequired: string;
		submitFailed: string;
	};
};

type ContactFormProps = {
	locale: string;
	copy: ContactFormCopy;
	className?: string;
};

export function ContactForm({ locale, copy, className }: ContactFormProps) {
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const schema = useMemo(
		() =>
			createContactFormSchema({
				fullNameRequired: copy.errors.fullNameRequired,
				emailInvalid: copy.errors.emailInvalid,
				subjectRequired: copy.errors.subjectRequired,
				messageRequired: copy.errors.messageRequired,
			}),
		[copy.errors],
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: "",
			email: "",
			phone: "",
			subject: "",
			message: "",
		},
	});

	const onSubmit = handleSubmit(async (values) => {
		setSubmitError(null);
		const result = await submitContactFormAction(locale, values);
		if (!result.success) {
			setSubmitError(copy.errors.submitFailed);
			return;
		}
		setSubmitted(true);
	});

	return (
		<HomeSection
			className={className}
			divider={false}
			aria-labelledby="contact-form-heading"
		>
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header className="max-w-2xl text-start">
					<h2
						id="contact-form-heading"
						className="font-heading text-h1 font-bold leading-[1.1] text-balance"
					>
						{copy.heading}
					</h2>
					{copy.description ? (
						<p className="mt-3 text-body leading-relaxed text-muted">
							{copy.description}
						</p>
					) : null}
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollRevealBlock>
					<div className="mx-auto max-w-4xl border border-border bg-surface p-6 sm:p-10 lg:p-12">
						{submitted ? (
							<div
								role="status"
								className="flex items-start gap-4 border border-border bg-background p-6 sm:p-8"
							>
								<CheckCircleIcon
									className="mt-0.5 size-7 shrink-0 text-primary"
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
								className="grid gap-6 sm:grid-cols-2 sm:gap-7"
								onSubmit={onSubmit}
								noValidate
							>
								<div className="sm:col-span-2">
									<Field
										label={copy.fields.fullName}
										error={errors.fullName?.message}
										required
									>
										{(props) => (
											<Input
												{...props}
												{...register("fullName")}
												placeholder={copy.placeholders.fullName}
											/>
										)}
									</Field>
								</div>
								<Field
									label={copy.fields.email}
									error={errors.email?.message}
									required
								>
									{(props) => (
										<Input
											{...props}
											{...register("email")}
											type="email"
											placeholder={copy.placeholders.email}
										/>
									)}
								</Field>
								<Field label={copy.fields.phone}>
									{(props) => (
										<Input
											{...props}
											{...register("phone")}
											type="tel"
											placeholder={copy.placeholders.phone}
										/>
									)}
								</Field>
								<div className="sm:col-span-2">
									<Field
										label={copy.fields.subject}
										error={errors.subject?.message}
										required
									>
										{(props) => (
											<Input
												{...props}
												{...register("subject")}
												placeholder={copy.placeholders.subject}
											/>
										)}
									</Field>
								</div>
								<div className="sm:col-span-2">
									<Field
										label={copy.fields.message}
										error={errors.message?.message}
										required
									>
										{(props) => (
											<Textarea
												{...props}
												{...register("message")}
												rows={6}
												placeholder={copy.placeholders.message}
											/>
										)}
									</Field>
								</div>
								<div className="mt-2 border-t border-border pt-6 sm:col-span-2">
									{submitError ? (
										<p role="alert" className="mb-4 text-small text-foreground">
											{submitError}
										</p>
									) : null}
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
				</ScrollRevealBlock>
			</div>
		</HomeSection>
	);
}
