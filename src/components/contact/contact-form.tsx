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
import {
	type ContactFormValues,
	createContactFormSchema,
} from "@/lib/schemas/contact-form";
import { cn } from "@/lib/utils";

type ContactFormCopy = {
	eyebrow: string;
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
	};
};

type ContactFormProps = {
	copy: ContactFormCopy;
	className?: string;
};

export function ContactForm({ copy, className }: ContactFormProps) {
	const [submitted, setSubmitted] = useState(false);

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

	const onSubmit = handleSubmit(async () => {
		await new Promise((resolve) => setTimeout(resolve, 400));
		setSubmitted(true);
	});

	return (
		<HomeSection className={className} aria-labelledby="contact-form-heading">
			<ScrollRevealBlock className={homeSectionHeaderClass}>
				<header>
					<div className="max-w-2xl text-start">
						{copy.eyebrow ? (
							<p className="label font-medium">{copy.eyebrow}</p>
						) : null}
						<h2
							id="contact-form-heading"
							className={cn(
								"font-heading text-h1 font-bold leading-[1.1] text-balance",
								copy.eyebrow ? "mt-2" : undefined,
							)}
						>
							{copy.heading}
						</h2>
						{copy.description ? (
							<p className="mt-3 text-body leading-relaxed text-muted">
								{copy.description}
							</p>
						) : null}
					</div>
				</header>
			</ScrollRevealBlock>

			<div className={homeSectionContentClass}>
				<ScrollRevealBlock>
					<div className="border border-border bg-surface p-6 sm:p-8 lg:p-10">
						{submitted ? (
							<div
								role="status"
								className="mx-auto flex max-w-3xl items-start gap-4 border border-border bg-background p-6 sm:p-8"
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
				</ScrollRevealBlock>
			</div>
		</HomeSection>
	);
}
