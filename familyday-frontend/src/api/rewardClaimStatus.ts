import { getViteApiBase } from "@/lib/apiBase";
import { FINISH_REWARD_SLOTS } from "@/constants";

export type RewardClaimStatusPayload = {
	claimedCount: number;
	maxSlots: number;
	/** 伺服器已結算、可用於領獎的完整通關次數（見後端 `bankedFullClears`） */
	bankedFullClears: number;
};

function clampCount(n: number, max: number): number {
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(max, Math.floor(n)));
}

function nonNegativeInt(n: number): number {
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.floor(n));
}

type DashboardProgress = {
	maxRounds?: number;
	fullClearCount?: number;
	bankedFullClears?: number;
	rewardRedeemCount?: number;
};

type DashboardJson = {
	progress?: DashboardProgress;
};

/**
 * 闖關禮領取狀態：資料來源為後端，此函式僅請求並正規化為畫面用數字。
 * `claimedCount` 僅對應 **已領／已核銷** 的 `rewardRedeemCount`，不使用 `fullClearCount`
 *（後者為通關輪次統計，語意不同）。
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

	const rawClaimed = p?.rewardRedeemCount ?? 0;
	const rawBanked = p?.bankedFullClears ?? 0;

	return {
		claimedCount: clampCount(Number(rawClaimed), maxSlots),
		maxSlots,
		bankedFullClears: nonNegativeInt(Number(rawBanked)),
	};
}
