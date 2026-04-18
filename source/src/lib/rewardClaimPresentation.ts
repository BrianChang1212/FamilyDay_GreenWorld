import { fetchRewardClaimStatus } from "@/api/rewardClaimStatus";
import { getViteApiBase } from "@/lib/apiBase";
import { FINISH_REWARD_SLOTS } from "@/lib/constants/finishReward";

export type RewardClaimStatusSource = "api" | "mock-query" | "local-fallback";

export type RewardClaimPresentationResult =
	| {
			loadState: "ok";
			claimed: number;
			maxSlots: number;
			statusSource: RewardClaimStatusSource;
	  }
	| {
			loadState: "error";
			statusSource: "api";
			error: string;
	  };

/**
 * 從路由 query 解析 `mock_claimed`（離線 UI 測試）；無效則 null。
 * 與 Vue Router 解耦，僅吃原始 query 值。
 */
export function parseMockClaimedQueryParam(
	queryValue: unknown,
	maxSlots: number,
): number | null {
	const s = Array.isArray(queryValue) ? queryValue[0] : queryValue;
	if (s === undefined || s === null || String(s).trim() === "") return null;
	const n = parseInt(String(s), 10);
	if (!Number.isFinite(n)) return null;
	return Math.max(0, Math.min(maxSlots, n));
}

/**
 * 決定領取成功頁的次數／來源：mock 參數、後端 dashboard，或本機後備。
 * 無 Vue 依賴；API 呼叫僅經由 `@/api/rewardClaimStatus`。
 */
export async function resolveRewardClaimPresentation(
	mockClaimed: number | null,
	getLocalFallbackCount: () => number,
): Promise<RewardClaimPresentationResult> {
	if (mockClaimed !== null) {
		return {
			loadState: "ok",
			claimed: mockClaimed,
			maxSlots: FINISH_REWARD_SLOTS,
			statusSource: "mock-query",
		};
	}

	if (getViteApiBase()) {
		try {
			const s = await fetchRewardClaimStatus();
			return {
				loadState: "ok",
				claimed: s.claimedCount,
				maxSlots: s.maxSlots,
				statusSource: "api",
			};
		} catch (e) {
			return {
				loadState: "error",
				statusSource: "api",
				error:
					e instanceof Error ? e.message : "無法載入領獎狀態",
			};
		}
	}

	return {
		loadState: "ok",
		claimed: getLocalFallbackCount(),
		maxSlots: FINISH_REWARD_SLOTS,
		statusSource: "local-fallback",
	};
}
