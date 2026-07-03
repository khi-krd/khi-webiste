import "server-only";

import { getApiBaseUrl, getMockDataMode } from "@/lib/api/config";

export type MockPolicyContext = "home" | "global";

type Identifiable = { id?: string | number };

function itemKey(item: Identifiable): string | null {
	if (item.id == null) {
		return null;
	}
	return String(item.id);
}

function sliceToTarget<T>(items: T[], targetCount?: number): T[] {
	if (targetCount == null) {
		return items;
	}
	return items.slice(0, targetCount);
}

export function padUniqueById<T extends Identifiable>(
	apiItems: T[],
	mockItems: T[],
	targetCount: number,
): T[] {
	const seen = new Set(
		apiItems.map(itemKey).filter((key): key is string => key != null),
	);
	const padded = [...apiItems];

	for (const mockItem of mockItems) {
		if (padded.length >= targetCount) {
			break;
		}

		const key = itemKey(mockItem);
		if (key != null && seen.has(key)) {
			continue;
		}

		padded.push(mockItem);
		if (key != null) {
			seen.add(key);
		}
	}

	return padded.slice(0, targetCount);
}

type ApplyMockPolicyOptions<T> = {
	context: MockPolicyContext;
	apiItems: T[];
	getMockItems: () => T[];
	targetCount?: number;
};

export function applyMockPolicy<T extends Identifiable>({
	context,
	apiItems,
	getMockItems,
	targetCount,
}: ApplyMockPolicyOptions<T>): T[] {
	const mode = getMockDataMode();

	if (mode === "full" || !getApiBaseUrl()) {
		return sliceToTarget(getMockItems(), targetCount);
	}

	if (mode === "off" || context === "global") {
		return sliceToTarget(apiItems, targetCount);
	}

	// auto + home
	if (apiItems.length === 0) {
		return sliceToTarget(getMockItems(), targetCount);
	}

	if (targetCount != null && apiItems.length < targetCount) {
		return padUniqueById(apiItems, getMockItems(), targetCount);
	}

	return sliceToTarget(apiItems, targetCount);
}

type ApplyMockPolicyNullableOptions<T> = {
	apiValue: T | null;
	getMockValue: () => T | null;
};

export function applyMockPolicyNullable<T>({
	apiValue,
	getMockValue,
}: ApplyMockPolicyNullableOptions<T>): T | null {
	const mode = getMockDataMode();

	if (mode === "full" || !getApiBaseUrl()) {
		return getMockValue();
	}

	return apiValue;
}
