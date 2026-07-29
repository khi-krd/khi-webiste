/**
 * Fallback texture for the writings hero, used when the catalogue has no cover
 * image to borrow. Lives here rather than under `lib/mock` because production
 * pages depend on it — see `app/[locale]/writings/page.tsx`.
 */
export const WRITINGS_STILL = "/writings/images/1.jpeg";
