import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;

const nextConfig: NextConfig = {
	images: {
		remotePatterns: mediaHost
			? [{ protocol: "https" as const, hostname: mediaHost }]
			: [],
	},
};

// Points next-intl at src/i18n/request.ts (the default location).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
