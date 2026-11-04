"use client";

import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

export type ListSelectOption = {
	value: string;
	label: string;
};

type ListSelectProps = {
	value: string;
	onChange: (value: string) => void;
	options: ListSelectOption[];
	label?: string;
	disabled?: boolean;
	className?: string;
	buttonClassName?: string;
	/** Written as `data-focus-key` on the trigger for post-navigation focus restore. */
	focusKey?: string;
};

/**
 * Filter-dropdown replacement for the native <select>: identical bordered-box
 * trigger, but the open list is ours — hover and the selected row tint with
 * the site's green instead of the browser's system blue. Closes on outside
 * pointer-down and Escape; arrows/Home/End move through the options.
 */
export function ListSelect({
	value,
	onChange,
	options,
	label,
	disabled,
	className,
	buttonClassName,
	focusKey,
}: ListSelectProps) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listId = useId();

	const selectedIndex = options.findIndex((o) => o.value === value);
	const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

	function openList() {
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		setOpen(true);
	}

	function pick(option: ListSelectOption) {
		onChange(option.value);
		setOpen(false);
		buttonRef.current?.focus();
	}

	useEffect(() => {
		if (!open) return;
		function onPointerDown(event: PointerEvent) {
			if (!wrapRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
				buttonRef.current?.focus();
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	useEffect(() => {
		if (!open || activeIndex < 0) return;
		wrapRef.current
			?.querySelector(`[data-index="${activeIndex}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [activeIndex, open]);

	function onButtonKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			openList();
		}
	}

	function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((i) => Math.min(i + 1, options.length - 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (event.key === "Home") {
			event.preventDefault();
			setActiveIndex(0);
		} else if (event.key === "End") {
			event.preventDefault();
			setActiveIndex(options.length - 1);
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const option = options[activeIndex];
			if (option) pick(option);
		} else if (event.key === "Tab") {
			setOpen(false);
		}
	}

	return (
		<div ref={wrapRef} className={cn("relative", className)}>
			<button
				ref={buttonRef}
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={label}
				data-focus-key={focusKey}
				onClick={() => (open ? setOpen(false) : openList())}
				onKeyDown={onButtonKeyDown}
				className={cn(
					"flex w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 pe-9 text-start text-body text-foreground",
					"transition-colors disabled:pointer-events-none disabled:opacity-50",
					open ? "border-foreground" : "fine-hover:border-foreground/40",
					buttonClassName,
				)}
			>
				<span className="min-w-0 flex-1 truncate">
					{selected?.label ?? " "}
				</span>
				<ChevronDownIcon
					className={cn(
						"pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted transition-transform duration-200",
						open && "rotate-180",
					)}
					aria-hidden
				/>
			</button>

			{open ? (
				<div
					role="listbox"
					id={listId}
					aria-label={label}
					aria-activedescendant={
						activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
					}
					tabIndex={-1}
					onKeyDown={onListKeyDown}
					className="absolute end-0 top-[calc(100%+0.25rem)] z-40 max-h-64 w-max min-w-full max-w-72 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-[0_12px_32px_color-mix(in_oklch,var(--color-foreground)_18%,transparent)]"
				>
					{options.map((option, index) => {
						const isSelected = option.value === value;
						const isActive = index === activeIndex;
						const green = isSelected || isActive;
						return (
							<button
								key={option.value || "__empty__"}
								id={`${listId}-${index}`}
								type="button"
								role="option"
								aria-selected={isSelected}
								data-index={index}
								onMouseEnter={() => setActiveIndex(index)}
								onClick={() => pick(option)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-start text-body transition-colors duration-100",
									green
										? "bg-primary font-medium text-primary-foreground"
										: "text-foreground",
								)}
							>
								<span className="min-w-0 flex-1 truncate">{option.label}</span>
								<CheckIcon
									className={cn(
										"size-4 shrink-0 transition-opacity",
										green ? "text-primary-foreground" : "text-primary",
										isSelected ? "opacity-100" : "opacity-0",
									)}
									aria-hidden
								/>
							</button>
						);
					})}
				</div>
			) : null}
		</div>
	);
}
