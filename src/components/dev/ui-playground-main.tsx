import type { ReactNode } from "react";

type UiPlaygroundMainProps = {
	children: ReactNode;
};

export function UiPlaygroundMain({ children }: UiPlaygroundMainProps) {
	return <div className="min-w-0">{children}</div>;
}
