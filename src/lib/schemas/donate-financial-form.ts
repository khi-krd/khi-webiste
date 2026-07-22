import { z } from "zod";
import {
	CURRENCY_IDS,
	type CurrencyId,
	PAYMENT_METHOD_IDS,
	type PaymentMethodId,
} from "@/lib/mock/donate";

export type DonateFinancialFormMessages = {
	amountRequired: string;
	amountInvalid: string;
	donorNameRequired: string;
	paymentMethodRequired: string;
};

export function createDonateFinancialFormSchema(
	messages: DonateFinancialFormMessages,
) {
	return z.object({
		amount: z
			.number({ message: messages.amountInvalid })
			.refine(
				(value) => Number.isFinite(value) && value >= 0.01,
				messages.amountInvalid,
			),
		currency: z
			.string()
			.refine(
				(value): value is CurrencyId =>
					CURRENCY_IDS.includes(value as CurrencyId),
				messages.amountInvalid,
			),
		donorName: z.string().trim().min(1, messages.donorNameRequired),
		paymentMethod: z
			.string()
			.min(1, messages.paymentMethodRequired)
			.refine(
				(value): value is PaymentMethodId =>
					PAYMENT_METHOD_IDS.includes(value as PaymentMethodId),
				messages.paymentMethodRequired,
			),
	});
}

export type DonateFinancialFormValues = z.input<
	ReturnType<typeof createDonateFinancialFormSchema>
>;
