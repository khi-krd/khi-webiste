import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16: middleware is now `proxy.ts`. The next-intl handler is unchanged.
export default createMiddleware(routing);

export const config = {
	// Match all pathnames except API routes, Next internals, and files with an
	// extension (static assets). next-intl handles locale prefixing on the rest.
	matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
