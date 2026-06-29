import type { About, AboutContent } from "@/types/about";
import type { Partner } from "@/types/partner";
import type { TeamMember as ApiTeamMember } from "@/types/team";
import type {
	FounderPerson,
	OfficeTeam,
	PartnerItem,
	TeamMember,
} from "@/lib/mock/about";

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

export function resolveAboutContent(
	locale: string,
	page: About,
): AboutContent | null {
	if (locale === "ckb") {
		return page.ckbContent ?? page.kmrContent ?? null;
	}
	return page.kmrContent ?? page.ckbContent ?? null;
}

export function resolveAboutSlug(locale: string, page: About): string | null {
	if (locale === "ckb") {
		return firstNonBlank(page.slugCkb, page.slugKmr);
	}
	return firstNonBlank(page.slugKmr, page.slugCkb);
}

export function resolveAboutStatLabel(
	locale: string,
	stat: { labelCkb?: string | null; labelKmr?: string | null },
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(stat.labelCkb, stat.labelKmr);
	}
	return firstNonBlank(stat.labelKmr, stat.labelCkb);
}

export type ResolvedFounder = FounderPerson & {
	name: string | null;
	bio: string | null;
};

export function resolveFounderFromAbout(
	locale: string,
	page: About | null,
): ResolvedFounder | null {
	if (!page?.founderImageUrl) {
		return null;
	}

	const name =
		locale === "ckb"
			? firstNonBlank(page.founderNameCkb, page.founderNameKmr)
			: firstNonBlank(page.founderNameKmr, page.founderNameCkb);
	const bio =
		locale === "ckb"
			? firstNonBlank(page.founderBioCkb, page.founderBioKmr)
			: firstNonBlank(page.founderBioKmr, page.founderBioCkb);

	return {
		image: {
			url: page.founderImageUrl,
			alt: name ?? undefined,
		},
		name,
		bio,
	};
}

const TEAM_OFFICE_ALIASES: Record<string, OfficeTeam["id"]> = {
	ERBIL: "sulaymaniyah",
	SULAYMANIYAH: "sulaymaniyah",
	SULAYMANIYA: "sulaymaniyah",
	DUHOK: "duhok",
};

function resolveTeamOfficeId(office: string | null | undefined): OfficeTeam["id"] {
	if (!office) {
		return "sulaymaniyah";
	}

	const normalized = office.trim().toUpperCase().replace(/[\s-]/g, "_");
	return TEAM_OFFICE_ALIASES[normalized] ?? "sulaymaniyah";
}

function resolveTeamMember(locale: string, member: ApiTeamMember): TeamMember {
	const name =
		locale === "ckb"
			? firstNonBlank(member.nameCkb, member.nameKmr)
			: firstNonBlank(member.nameKmr, member.nameCkb);
	const role =
		locale === "ckb"
			? firstNonBlank(member.roleCkb, member.roleKmr)
			: firstNonBlank(member.roleKmr, member.roleCkb);

	return {
		id: String(member.id),
		image: {
			url: member.imageUrl ?? "/menu/1.jpg",
			alt: name ?? undefined,
		},
		name: name ?? undefined,
		role: role ?? undefined,
	};
}

export function resolveTeamOffices(
	locale: string,
	members: ApiTeamMember[],
): OfficeTeam[] {
	const grouped = new Map<OfficeTeam["id"], TeamMember[]>();

	for (const member of members) {
		const officeId = resolveTeamOfficeId(member.office);
		const resolvedMember = resolveTeamMember(locale, member);
		const existing = grouped.get(officeId) ?? [];
		existing.push(resolvedMember);
		grouped.set(officeId, existing);
	}

	const offices: OfficeTeam[] = [
		{ id: "sulaymaniyah", members: [] },
		{ id: "duhok", members: [] },
	];

	for (const office of offices) {
		office.members =
			grouped
				.get(office.id)
				?.sort(
					(a, b) =>
						(members.find((entry) => String(entry.id) === a.id)?.displayOrder ??
							0) -
						(members.find((entry) => String(entry.id) === b.id)?.displayOrder ??
							0),
				) ?? [];
	}

	return offices.filter((office) => office.members.length > 0);
}

export function resolvePartnerItems(
	locale: string,
	partners: Partner[],
): PartnerItem[] {
	return partners
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
		.map((partner) => {
			const title =
				locale === "ckb"
					? firstNonBlank(partner.nameCkb, partner.nameKmr)
					: firstNonBlank(partner.nameKmr, partner.nameCkb);
			const description =
				locale === "ckb"
					? firstNonBlank(partner.descriptionCkb, partner.descriptionKmr)
					: firstNonBlank(partner.descriptionKmr, partner.descriptionCkb);
			const slug = String(partner.id);

			return {
				id: slug,
				slug,
				image: {
					url: partner.logoUrl ?? "/menu/1.jpg",
					alt: title ?? undefined,
				},
				href: partner.websiteUrl ?? "#",
				title: title ?? undefined,
				description: description ?? undefined,
			};
		});
}
