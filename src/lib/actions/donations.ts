"use server";

import { getApiBaseUrl } from "@/lib/api/config";
import { submitFinancialDonation } from "@/lib/api/donations";
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

	const apiBaseUrl = getApiBaseUrl();
	if (!apiBaseUrl) {
		return { success: false, error: "submit_failed" };
	}

	// The attachment travels as a real file part — the backend stores it and
	// links the public URL onto the donation record.
	const form = new FormData();
	form.set("donorName", values.userName);
	form.set("email", "");
	form.set("phone", values.contactNumber);
	form.set("materialType", materialType);
	if (values.registerName?.trim()) {
		form.set("title", values.registerName.trim());
	}
	if (values.note?.trim()) {
		form.set("description", values.note.trim());
	}
	const file = values.file;
	if (file != null && typeof file === "object" && "size" in file && file.size > 0) {
		form.set("file", file as File, (file as File).name);
	}

	try {
		const response = await fetch(`${apiBaseUrl}/api/v1/donations/archive`, {
			method: "POST",
			body: form,
			cache: "no-store",
		});
		if (!response.ok) {
			return { success: false, error: "submit_failed" };
		}
		const payload = (await response.json()) as { success?: boolean };
		if (payload?.success === false) {
			return { success: false, error: "submit_failed" };
		}
		return { success: true };
	} catch {
		return { success: false, error: "submit_failed" };
	}
}
