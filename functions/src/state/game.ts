import { getDb, useFirestoreStore } from "../utils/store";

/** 後端只維護「題目代號 + 正解選項」，題幹／選項文案由前端題庫負責 */
export type ChallengeSpec = {
	id: string;
	correctChoiceId: string;
};

export type PlayerProgress = {
	currentStageId: number;
	completedStageIds: number[];
	/** 曾按下「再玩一輪」且當時已全通關的次數（統計用，可無限累加） */
	fullClearCount: number;
	/** 已成功通關完整一輪的累計次數（每次答完最後一關 +1）；領獎須 banked > rewardRedeemCount */
	bankedFullClears: number;
	rewardRedeemCount: number;
	/** 闖關禮最多可領次數（目前 3）；闖關本身不限次數 */
	maxRounds: number;
};

const CHALLENGES: ChallengeSpec[] = [
	{ id: "c1", correctChoiceId: "B" },
	{ id: "c2", correctChoiceId: "B" },
	{ id: "c3", correctChoiceId: "B" },
	{ id: "c4", correctChoiceId: "B" },
	{ id: "c5", correctChoiceId: "B" },
	{ id: "c6", correctChoiceId: "C" },
];

const playerProgress = new Map<string, PlayerProgress>();

function coerceStageIds(arr: unknown): number[] {
	if (!Array.isArray(arr)) {
		return [];
	}
	const s = new Set<number>();
	for (const x of arr) {
		const n = Number(x);
		if (Number.isFinite(n)) {
			s.add(Math.floor(n));
		}
	}
	return Array.from(s).sort((a, b) => a - b);
}

/** 合併預設值、舊文件缺欄位時推斷 `bankedFullClears` */
function coercePlayerProgress(raw: Record<string, unknown>): PlayerProgress {
	const d = defaultProgress();
	const merged: PlayerProgress = {
		currentStageId: Math.max(
			1,
			Math.min(
				CHALLENGES.length,
				Math.floor(Number(raw.currentStageId)) || d.currentStageId,
			),
		),
		completedStageIds: coerceStageIds(raw.completedStageIds),
		fullClearCount: Math.max(0, Math.floor(Number(raw.fullClearCount) || 0)),
		bankedFullClears: 0,
		rewardRedeemCount: Math.max(0, Math.floor(Number(raw.rewardRedeemCount) || 0)),
		maxRounds: Math.max(1, Math.floor(Number(raw.maxRounds) || d.maxRounds)),
	};

	const rawBanked = raw.bankedFullClears;
	let banked: number;
	if (rawBanked !== undefined && rawBanked !== null && Number.isFinite(Number(rawBanked))) {
		banked = Math.max(0, Math.floor(Number(rawBanked)));
	} else {
		banked = Math.max(merged.fullClearCount, merged.rewardRedeemCount);
		if (
			merged.completedStageIds.length >= CHALLENGES.length &&
			banked === merged.rewardRedeemCount &&
			merged.rewardRedeemCount === merged.fullClearCount
		) {
			banked += 1;
		}
	}
	merged.bankedFullClears = banked;
	return merged;
}

export function defaultProgress(): PlayerProgress {
	return {
		currentStageId: 1,
		completedStageIds: [],
		fullClearCount: 0,
		bankedFullClears: 0,
		rewardRedeemCount: 0,
		maxRounds: 3,
	};
}

export function getChallenge(challengeId: string): ChallengeSpec | null {
	return CHALLENGES.find((v) => v.id === challengeId) ?? null;
}

export function stageIdToChallengeId(stageId: number): string {
	if (stageId < 1 || stageId > CHALLENGES.length) {
		return CHALLENGES[0].id;
	}
	return CHALLENGES[stageId - 1].id;
}

export async function getOrInitProgress(employeeId: string): Promise<PlayerProgress> {
	if (useFirestoreStore()) {
		const db = getDb();
		const ref = db.collection("player_progress").doc(employeeId);
		const snap = await ref.get();
		if (snap.exists) {
			const raw = snap.data() as Record<string, unknown>;
			const p = coercePlayerProgress(raw);
			if (raw.bankedFullClears === undefined || raw.bankedFullClears === null) {
				await ref.set({ bankedFullClears: p.bankedFullClears }, { merge: true });
			}
			return p;
		}
		const init = defaultProgress();
		await ref.set(init, { merge: true });
		return init;
	}

	const found = playerProgress.get(employeeId);
	if (found) {
		const p = coercePlayerProgress(found as unknown as Record<string, unknown>);
		playerProgress.set(employeeId, p);
		return p;
	}
	const init = defaultProgress();
	playerProgress.set(employeeId, init);
	return init;
}

export async function applyAttemptResult(
	employeeId: string,
	challengeId: string,
	choiceId: string,
): Promise<{ correct: boolean; nextStageId: number | null }> {
	const spec = getChallenge(challengeId);
	if (!spec) {
		return { correct: false, nextStageId: null };
	}
	const progress = await getOrInitProgress(employeeId);
	const correct = spec.correctChoiceId === choiceId;
	if (!correct) {
		return {
			correct: false,
			nextStageId: progress.currentStageId,
		};
	}

	const stageIdx = CHALLENGES.findIndex((v) => v.id === challengeId);
	const stageId = stageIdx + 1;
	if (stageId <= 0) {
		return {
			correct: false,
			nextStageId: progress.currentStageId,
		};
	}

	/*
	 * 前端若從首頁／說明重置本地關卡但未呼叫 restart API，伺服器仍為 6/6，
	 * 第二輪無法再累加 bankedFullClears。在「上一輪獎勵已領」（redeem >= banked）
	 * 時於第 1 關答對自動開新一輪，等同補做 playthrough/restart。
	 */
	if (
		stageId === 1 &&
		progress.completedStageIds.length >= CHALLENGES.length &&
		progress.rewardRedeemCount >= progress.bankedFullClears
	) {
		progress.completedStageIds = [];
		progress.currentStageId = 1;
		progress.fullClearCount += 1;
	}

	const priorCompletedLen = progress.completedStageIds.length;

	if (stageId > 0 && !progress.completedStageIds.includes(stageId)) {
		progress.completedStageIds.push(stageId);
		progress.completedStageIds.sort((a, b) => a - b);
	}

	if (progress.completedStageIds.length >= CHALLENGES.length) {
		progress.currentStageId = CHALLENGES.length;
		if (
			priorCompletedLen < CHALLENGES.length &&
			progress.completedStageIds.length >= CHALLENGES.length
		) {
			progress.bankedFullClears += 1;
		}
		if (useFirestoreStore()) {
			const db = getDb();
			await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
		} else {
			playerProgress.set(employeeId, progress);
		}
		return { correct: true, nextStageId: null };
	}

	progress.currentStageId = Math.min(stageId + 1, CHALLENGES.length);
	if (useFirestoreStore()) {
		const db = getDb();
		await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
	} else {
		playerProgress.set(employeeId, progress);
	}
	return { correct: true, nextStageId: progress.currentStageId };
}

/**
 * Finish 頁玩家按「確認領獎」：伺服器遞增一次 `rewardRedeemCount`（最多 `maxRounds` 次）。
 * 須已全通關，且尚有一次未領的完整通關額度：`bankedFullClears > rewardRedeemCount`。
 */
export async function claimFinishRewardProgress(
	employeeId: string,
): Promise<
	| { ok: true; rewardRedeemCount: number }
	| { ok: false; code: string; message: string }
> {
	const progress = await getOrInitProgress(employeeId);
	const need = CHALLENGES.length;
	if (progress.completedStageIds.length < need) {
		return {
			ok: false,
			code: "FINISH_CLAIM_NOT_READY",
			message: "all stages must be completed before claiming",
		};
	}
	if (progress.rewardRedeemCount >= progress.maxRounds) {
		return {
			ok: false,
			code: "REWARD_CLAIM_LIMIT_REACHED",
			message: "reward claim limit reached",
		};
	}
	if (progress.bankedFullClears <= progress.rewardRedeemCount) {
		return {
			ok: false,
			code: "REWARD_CLAIM_NOT_ELIGIBLE",
			message: "no banked full clear available to claim",
		};
	}

	progress.rewardRedeemCount += 1;
	if (useFirestoreStore()) {
		const db = getDb();
		await db
			.collection("player_progress")
			.doc(employeeId)
			.set({ rewardRedeemCount: progress.rewardRedeemCount }, { merge: true });
	} else {
		playerProgress.set(employeeId, progress);
	}
	return { ok: true, rewardRedeemCount: progress.rewardRedeemCount };
}

export async function restartPlaythrough(employeeId: string): Promise<{
	ok: boolean;
	fullClearCount: number;
	remainingRounds: number | null;
} | null> {
	const progress = await getOrInitProgress(employeeId);
	if (progress.completedStageIds.length < CHALLENGES.length) {
		return null;
	}

	progress.fullClearCount += 1;
	progress.completedStageIds = [];
	progress.currentStageId = 1;
	if (useFirestoreStore()) {
		const db = getDb();
		await db.collection("player_progress").doc(employeeId).set(progress, { merge: true });
	} else {
		playerProgress.set(employeeId, progress);
	}
	return {
		ok: true,
		fullClearCount: progress.fullClearCount,
		remainingRounds: null,
	};
}
