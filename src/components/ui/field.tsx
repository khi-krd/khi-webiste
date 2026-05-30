"use client";

import { type ReactNode, useId } from "react";

/** ARIA props the Field computes and the control must spread onto itself. */
export type FieldControlProps = {
	id: string;
	"aria-describedby": string | undefined;
	"aria-invalid": true | undefined;
	"aria-required": true | undefined;
};

type FieldProps = {
	label: ReactNode;
	/** Optional helper text rendered under the label. */
	description?: ReactNode;
	/** Error message; when present the control is marked invalid. */
	error?: ReactNode;
	required?: boolean;
	/**
	 * Render-prop receiving the wired ARIA props. Spread them onto the control,
	 * e.g. <Field label="Email">{(p) => <Input {...p} {...register("email")} />}</Field>.
	 * Render-prop keeps Field decoupled from react-hook-form.
	 */
	children: (props: FieldControlProps) => ReactNode;
};

/**
 * Composes label + control + description + error with correct ARIA wiring.
 *
 * Client component: it calls `useId()` to mint SSR-stable ids that link the
 * label, description, and error to the control — a hook, so it can't be a
 * Server Component. Forms are client trees anyway.
 *
 * Logical-property friendly: stacked layout, `text-start` alignment, so it
 * mirrors cleanly in RTL with no physical left/right.
 */
export function Field({
	label,
	description,
	error,
	required = false,
	children,
}: FieldProps) {
	const id = useId();
	const descriptionId = description ? `${id}-description` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	const describedBy =
		[descriptionId, errorId].filter(Boolean).join(" ") || undefined;

	return (
		<div className="flex flex-col gap-1.5 text-start">
			<label htmlFor={id} className="text-small font-medium text-foreground">
				{label}
				{required && (
					<span aria-hidden className="text-muted">
						{" *"}
					</span>
				)}
			</label>

			{description && (
				<p id={descriptionId} className="text-small text-muted">
					{description}
				</p>
			)}

			{children({
				id,
				"aria-describedby": describedBy,
				"aria-invalid": error ? true : undefined,
				"aria-required": required || undefined,
			})}

			{error && (
				<p id={errorId} role="alert" className="text-small text-foreground">
					{error}
				</p>
			)}
		</div>
	);
}
