import { getViteApiBase } from "@/lib/apiBase";
import { setCompletedStageIdsFromApi } from "@/lib/demoState";

type ChallengeJson = {
	challengeId?: string;
	title?: string;
	options?: string[];
};

type AttemptJson = {
	correct?: boolean;
	nextChallengeId?: string;
	nextStageId?: number;
	completedStageIds?: number[];
	allStagesCompleted?: boolean;
};

type VerifyJson = {
	challengeId?: string;
};

type RestartJson = {
	ok?: boolean;
};

type RewardClaimJson = {
	ok?: boolean;
	rewardRedeemCount?: number;
};

function getBaseOrThrow(): string {
	const base = getViteApiBase();
	if (!base) {
		throw new Error("VITE_API_BASE is not configured");
	}
	return base;
}

export async function verifyStation(stageId: number, qrJwt: string): Promise<string> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/stations/verify`, {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ stageId, qrJwt }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`stations/verify ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as VerifyJson;
	if (!data.challengeId) {
		throw new Error("stations/verify missing challengeId");
	}
	return data.challengeId;
}

export async function fetchChallenge(
	challengeId: string,
): Promise<{ challengeId: string; title: string; options: string[] }> {
	const base = getBaseOrThrow();
	const res = await fetch(
		`${base}/api/v1/challenges/${encodeURIComponent(challengeId)}`,
		{
			credentials: "include",
			headers: { Accept: "application/json" },
		},
	);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`challenges/${challengeId} ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as ChallengeJson;
	return {
		challengeId: data.challengeId || challengeId,
		title: data.title || challengeId,
		options: Array.isArray(data.options) ? data.options : [],
	};
}

export async function submitChallengeAttempt(
	challengeId: string,
	answer: string,
): Promise<{
	correct: boolean;
	nextChallengeId: string | null;
	completedStageIds: number[];
	allStagesCompleted: boolean;
}> {
	const base = getBaseOrThrow();
	const res = await fetch(
		`${base}/api/v1/challenges/${encodeURIComponent(challengeId)}/attempts`,
		{
			method: "POST",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ answer }),
		},
	);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`attempts ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as AttemptJson;
	const nextChallengeId =
		typeof data.nextChallengeId === "string"
			? data.nextChallengeId
			: Number.isFinite(data.nextStageId)
				? `c${data.nextStageId}`
				: null;
	const completedStageIds = Array.isArray(data.completedStageIds)
		? data.completedStageIds
				.map((n) => Math.floor(Number(n)))
				.filter((n) => Number.isFinite(n) && n >= 1 && n <= 6)
		: [];
	return {
		correct: data.correct === true,
		nextChallengeId,
		completedStageIds,
		allStagesCompleted: data.allStagesCompleted === true,
	};
}

type DashboardJson = {
	progress?: { completedStageIds?: unknown };
};

/** 登入後同步後端已答對站點，與 `GET /me/dashboard` 一致 */
export async function syncLocalProgressFromDashboard(): Promise<void> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/me/dashboard`, {
		credentials: "include",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		return;
	}
	const data = (await res.json()) as DashboardJson;
	const raw = data.progress?.completedStageIds;
	if (!Array.isArray(raw)) {
		return;
	}
	setCompletedStageIdsFromApi(
		raw.map((x) => Math.floor(Number(x))).filter((n) => n >= 1 && n <= 6),
	);
}

export async function restartPlaythrough(): Promise<void> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/me/playthrough/restart`, {
		method: "POST",
		credentials: "include",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`playthrough/restart ${res.status}: ${text.slice(0, 200)}`);
	}
	const data = (await res.json()) as RestartJson;
	if (!data.ok) {
		throw new Error("playthrough/restart failed");
	}
}

/** Finish 頁確認領獎：後端遞增 `rewardRedeemCount`（須符合通關與輪次規則）。 */
export async function claimFinishReward(): Promise<{ rewardRedeemCount: number }> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/me/reward/claim`, {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: "{}",
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`me/reward/claim ${res.status}: ${text.slice(0, 200)}`);
	}
	const data = (await res.json()) as RewardClaimJson;
	if (data.ok !== true || typeof data.rewardRedeemCount !== "number") {
		throw new Error("me/reward/claim invalid response");
	}
	return { rewardRedeemCount: data.rewardRedeemCount };
}

export async function logoutGame(): Promise<void> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/auth/logout`, {
		method: "POST",
		credentials: "include",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`auth/logout ${res.status}: ${text.slice(0, 200)}`);
	}
}
