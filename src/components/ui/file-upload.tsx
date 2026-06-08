"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import {
	type ChangeEvent,
	type ComponentPropsWithoutRef,
	forwardRef,
	useRef,
} from "react";
import { cn } from "@/lib/utils";

type FileUploadProps = {
	placeholder: string;
	value?: File | null;
	onChange?: (file: File | null) => void;
	accept?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "type" | "value" | "onChange">;

/**
 * Dashed hairline drop zone with hidden native file input.
 * Forwards ref to the underlying input for react-hook-form Controller.
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
	(
		{
			placeholder,
			value,
			onChange,
			accept,
			className,
			id,
			name,
			disabled,
			"aria-describedby": ariaDescribedBy,
			"aria-invalid": ariaInvalid,
			...props
		},
		ref,
	) => {
		const innerRef = useRef<HTMLInputElement | null>(null);

		const setRefs = (node: HTMLInputElement | null) => {
			innerRef.current = node;
			if (typeof ref === "function") {
				ref(node);
			} else if (ref) {
				ref.current = node;
			}
		};

		const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0] ?? null;
			onChange?.(file);
		};

		const label = value?.name ?? placeholder;

		return (
			<div className={cn("relative w-full", className)}>
				<input
					ref={setRefs}
					id={id}
					name={name}
					type="file"
					accept={accept}
					disabled={disabled}
					className="peer sr-only"
					onChange={handleChange}
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					{...props}
				/>
				<label
					htmlFor={id}
					className={cn(
						"flex min-h-24 cursor-pointer items-center gap-3 border border-dashed border-border-strong bg-surface px-4 py-4 text-start transition-colors",
						"peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
						"peer-disabled:pointer-events-none peer-disabled:opacity-50",
						"peer-aria-[invalid=true]:border-foreground",
						"fine-hover:bg-sunken/30",
					)}
				>
					<span className="inline-flex size-10 shrink-0 items-center justify-center border border-border bg-background">
						<ArrowUpTrayIcon className="size-5 text-muted" aria-hidden />
					</span>
					<span
						className={cn(
							"text-body leading-snug",
							value ? "text-foreground" : "text-muted",
						)}
					>
						{label}
					</span>
				</label>
			</div>
		);
	},
);
FileUpload.displayName = "FileUpload";

export type { FileUploadProps };
