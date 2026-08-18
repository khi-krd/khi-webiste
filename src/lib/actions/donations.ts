"use server";

import {
	submitArchiveDonation,
	submitFinancialDonation,
} from "@/lib/api/donations";
import type { MaterialTypeId, PaymentMethodId } from "@/lib/donate/content";
import type { DonateArchiveFormValues } from "@/lib/schemas/donate-archive-form";
import type { DonateFinancialFormValues } from "@/lib/schemas/donate-financial-form";
import type { ArchiveMaterialType } from "@/types/donation";

export type DonationFormActionResult =
	| { success: true }
	| { success: false; error: "submit_failed" };

const MATERIAL_TYPE_MAP: Record<MaterialTypeId, ArchiveMaterialType> = {
	cassetteAudio: "AUDIO",
	photograph: "PHOTOGRAPH",
	manuscript: "MANUSCRIPT",
	document: "DOCUMENT",
	video: "VIDEO",
	other: "OTHER",
};

const PAYMENT_METHOD_MAP: Record<PaymentMethodId, string> = {
	fib: "BANK_TRANSFER",
	fastpay: "BANK_TRANSFER",
};

export async function submitFinancialDonationAction(
	values: DonateFinancialFormValues,
): Promise<DonationFormActionResult> {
	const paymentMethod =
		PAYMENT_METHOD_MAP[values.paymentMethod as PaymentMethodId];

	const result = await submitFinancialDonation({
		donorName: values.donorName,
		email: "",
		amount: values.amount,
		currency: values.currency.toUpperCase(),
		paymentMethod,
	});

	if (!result) {
		return { success: false, error: "submit_failed" };
	}

	return { success: true };
}

export async function submitArchiveDonationAction(
	values: DonateArchiveFormValues,
): Promise<DonationFormActionResult> {
	const materialType = MATERIAL_TYPE_MAP[values.materialType as MaterialTypeId];

	const result = await submitArchiveDonation({
		donorName: values.userName,
		email: "",
		phone: values.contactNumber,
		materialType,
		title: values.registerName?.trim() || undefined,
		description: values.note?.trim() || undefined,
	});

	if (!result) {
		return { success: false, error: "submit_failed" };
	}

	return { success: true };
}
