import { HeaderNav } from "@/components/layout/header-nav";
import { HeaderShell } from "@/components/layout/header-shell";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";

/**
 * Site header. Server Component shell — interactive items live in <HeaderNav/>.
 *
 * Sticky top bar in document flow (not a floating overlay): logo + institute
 * name on the leading side, trailing cluster grouped as primary nav
 * (menu · about · services) and utilities (search · language). Search opens
 * the drawer overlay in search mode.
 */
export function Header() {
	return (
		<HeaderShell>
			<Container className="relative flex h-16 max-w-none items-center justify-between gap-4 px-8 sm:h-20 sm:px-10">
				<Logo />
				<HeaderNav />
			</Container>
		</HeaderShell>
	);
}
