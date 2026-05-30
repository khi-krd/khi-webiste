import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation helpers. Use these (and the <Link> in
 * components/ui/link.tsx that wraps this Link) instead of next/link &
 * next/navigation so the active locale prefix is always preserved.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
