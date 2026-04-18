import { getViteApiBase } from "@/lib/apiBase";
import { FINISH_REWARD_SLOTS } from "@/lib/constants/finishReward";

export type RewardClaimStatusPayload = {
	claimedCount: number;
	maxSlots: number;
};

function clampCount(n: number, max: number): number {
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(max, Math.floor(n)));
}

type DashboardProgress = {
	maxRounds?: number;
	fullClearCount?: number;
	/** 若後端另開欄位記錄櫃台核銷次數，優先採用（見 docs/specs/api-v0.1.md 演進） */
	rewardRedeemCount?: number;
};

type DashboardJson = {
	progress?: DashboardProgress;
};

/**
 * 闖關禮領取狀態：資料來源為後端，此函式僅請求並正規化為畫面用數字。
 * 映射規則：優先 `progress.rewardRedeemCount`，否則暫用 `progress.fullClearCount`（以前後端對齊為準）。
 */
export async function fetchRewardClaimStatus(): Promise<RewardClaimStatusPayload> {
	const base = getViteApiBase();
	if (!base) {
		throw new Error("VITE_API_BASE is not configured");
	}

	const res = await fetch(`${base}/api/v1/me/dashboard`, {
		credentials: "include",
		headers: { Accept: "application/json" },
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`dashboard ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as DashboardJson;
	const p = data.progress;

	const maxRaw = p?.maxRounds;
	const maxSlots =
		typeof maxRaw === "number" &&
		Number.isFinite(maxRaw) &&
		maxRaw > 0 &&
		maxRaw <= 99
			? Math.floor(maxRaw)
			: FINISH_REWARD_SLOTS;

	const rawClaimed =
		p?.rewardRedeemCount ?? p?.fullClearCount ?? 0;

	return {
		claimedCount: clampCount(Number(rawClaimed), maxSlots),
		maxSlots,
	};
}
