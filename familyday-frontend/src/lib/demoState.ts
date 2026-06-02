import {
	FINISH_REWARD_SLOTS,
	GAME_CONFIG,
	STORAGE_KEYS,
} from "@/constants";

export { FINISH_REWARD_SLOTS };

const K = {
	stage: STORAGE_KEYS.stage,
	completedStageIds: STORAGE_KEYS.completedStageIds,
	name: STORAGE_KEYS.name,
	employeeId: STORAGE_KEYS.employeeId,
	inZone: STORAGE_KEYS.inZone,
	pendingStationChallenge: STORAGE_KEYS.pendingStationChallenge,
	pendingFinish: STORAGE_KEYS.pendingFinish,
	/** 終點領獎已領次數 0…FINISH_REWARD_SLOTS（僅此路徑有「最多 N 次」上限） */
	finishClaimed: STORAGE_KEYS.finishClaimed,
	/** 現場報到：同行人數（原型暫存） */
	companionCount: STORAGE_KEYS.companionCount,
	/** 現場報到：是否已完成送出（原型；與闖關流程分離） */
	checkinDone: STORAGE_KEYS.checkinDone,
} as const;

export function getFinishClaimedCount(): number {
	const v = sessionStorage.getItem(K.finishClaimed);
	const n = v ? parseInt(v, 10) : 0;
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(FINISH_REWARD_SLOTS, n));
}

function setFinishClaimedCount(n: number): void {
	sessionStorage.setItem(
		K.finishClaimed,
		String(Math.max(0, Math.min(FINISH_REWARD_SLOTS, n))),
	);
}

/** 領獎確認後遞增，回傳更新後的次數（已滿則不變） */
export function incrementFinishClaimed(): number {
	const n = getFinishClaimedCount();
	if (n >= FINISH_REWARD_SLOTS) return n;
	const next = n + 1;
	setFinishClaimedCount(next);
	return next;
}

export function getStage(): number {
	const v = sessionStorage.getItem(K.stage);
	const n = v ? parseInt(v, 10) : GAME_CONFIG.MIN_STAGE;
	return Number.isFinite(n) &&
		n >= GAME_CONFIG.MIN_STAGE &&
		n <= GAME_CONFIG.TOTAL_STAGES
		? n
		: GAME_CONFIG.MIN_STAGE;
}

export function setStage(n: number): void {
	sessionStorage.setItem(
		K.stage,
		String(
			Math.min(
				GAME_CONFIG.TOTAL_STAGES,
				Math.max(GAME_CONFIG.MIN_STAGE, n),
			),
		),
	);
}

/**
 * 解碼 `sessionStorage` 內已答對站台 id 陣列。
 */
function readCompletedStageIdsRaw(): number[] {
	try {
		const raw = sessionStorage.getItem(K.completedStageIds);
		if (!raw) return [];
		const arr = JSON.parse(raw) as unknown;
		if (!Array.isArray(arr)) return [];
		const out: number[] = [];
		for (const x of arr) {
			const n = Math.floor(Number(x));
			if (
				Number.isFinite(n) &&
				n >= GAME_CONFIG.MIN_STAGE &&
				n <= GAME_CONFIG.TOTAL_STAGES
			) {
				out.push(n);
			}
		}
		return [...new Set(out)].sort((a, b) => a - b);
	} catch {
		return [];
	}
}

/** 已答對的站點（1–6），與後端 `completedStageIds` 對齊；任意順序。 */
export function getCompletedStageIds(): number[] {
	return readCompletedStageIdsRaw();
}

export function setCompletedStageIdsFromApi(ids: number[]): void {
	const sorted = [...new Set(ids)]
		.map((n) => Math.floor(Number(n)))
		.filter(
			(n) =>
				Number.isFinite(n) &&
				n >= GAME_CONFIG.MIN_STAGE &&
				n <= GAME_CONFIG.TOTAL_STAGES,
		)
		.sort((a, b) => a - b);
	sessionStorage.setItem(K.completedStageIds, JSON.stringify(sorted));
}

/** 答對一關後合併（不重複）。 */
export function addCompletedStageId(stageId: number): void {
	const n = Math.floor(stageId);
	if (
		!Number.isFinite(n) ||
		n < GAME_CONFIG.MIN_STAGE ||
		n > GAME_CONFIG.TOTAL_STAGES
	) {
		return;
	}
	const cur = new Set(getCompletedStageIds());
	cur.add(n);
	setCompletedStageIdsFromApi([...cur]);
}

export function isStageCompleted(stageId: number): boolean {
	return getCompletedStageIds().includes(stageId);
}

/**
 * 重置關卡進度（站點、到站狀態、已完成站點列表）。
 * 不會清除姓名、員編、報到。不會清除終點 **闖關禮已領取次數**（僅領獎路徑受 `FINISH_REWARD_SLOTS` 上限；關卡可反复通關）。
 * 由歡迎／說明頁進入時呼叫；`RegisterView` 登入流程亦會先呼叫此函式以清空本地殘留，
 * 接著 `syncLocalProgressFromDashboard` 從後端 `/me/dashboard` 還原已完成站點。
 */
export function resetScavengerRun(): void {
	setStage(GAME_CONFIG.MIN_STAGE);
	setInZone(false);
	clearPendingStationVerification();
	clearPendingFinish();
	sessionStorage.removeItem(K.completedStageIds);
}

export type PendingStationVerification = {
	stage: number;
	challengeId: string;
};

/** 掃碼成功後寫入，與目前選定站點綁定；答對離開或改選站點時清除。 */
export function getPendingStationVerification(): PendingStationVerification | null {
	try {
		const raw = sessionStorage.getItem(K.pendingStationChallenge);
		if (!raw) return null;
		const o = JSON.parse(raw) as {
			stage?: unknown;
			challengeId?: unknown;
		};
		const stage = Math.floor(Number(o.stage));
		const challengeId =
			typeof o.challengeId === "string" ? o.challengeId.trim() : "";
		if (
			!challengeId ||
			!Number.isFinite(stage) ||
			stage < GAME_CONFIG.MIN_STAGE ||
			stage > GAME_CONFIG.TOTAL_STAGES
		) {
			return null;
		}
		return { stage, challengeId };
	} catch {
		return null;
	}
}

export function setPendingStationVerification(
	stage: number,
	challengeId: string,
): void {
	const cid = challengeId.trim();
	if (!cid) {
		sessionStorage.removeItem(K.pendingStationChallenge);
		return;
	}
	const n = Math.floor(stage);
	if (
		!Number.isFinite(n) ||
		n < GAME_CONFIG.MIN_STAGE ||
		n > GAME_CONFIG.TOTAL_STAGES
	) {
		sessionStorage.removeItem(K.pendingStationChallenge);
		return;
	}
	sessionStorage.setItem(
		K.pendingStationChallenge,
		JSON.stringify({ stage: n, challengeId: cid }),
	);
}

export function clearPendingStationVerification(): void {
	sessionStorage.removeItem(K.pendingStationChallenge);
}

/**
 * 領獎入口（`/reward`）QR 掃描後寫入此旗標；未登入導 `/register`，
 * 登入完成讀此值決定是否直接 push `/finish`。
 */
export function getPendingFinish(): boolean {
	return sessionStorage.getItem(K.pendingFinish) === "1";
}

export function setPendingFinish(v: boolean): void {
	if (v) sessionStorage.setItem(K.pendingFinish, "1");
	else sessionStorage.removeItem(K.pendingFinish);
}

export function clearPendingFinish(): void {
	sessionStorage.removeItem(K.pendingFinish);
}

/** 答對後前進一站並重置到站狀態（最後一站不遞增） */
export function advanceStage(): void {
	const s = getStage();
	if (s < GAME_CONFIG.TOTAL_STAGES) {
		setStage(s + 1);
		setInZone(false);
		clearPendingStationVerification();
	}
}

export function getInZone(): boolean {
	return sessionStorage.getItem(K.inZone) === "1";
}

export function setInZone(v: boolean): void {
	sessionStorage.setItem(K.inZone, v ? "1" : "0");
}

export function getProfile(): { name: string; employeeId: string } {
	return {
		name: sessionStorage.getItem(K.name) ?? "",
		employeeId: sessionStorage.getItem(K.employeeId) ?? "",
	};
}

export function setProfile(name: string, employeeId: string): void {
	sessionStorage.setItem(K.name, name.trim());
	sessionStorage.setItem(K.employeeId, employeeId.trim());
}

export function getCompanionCount(): number {
	const v = sessionStorage.getItem(K.companionCount);
	const n = v ? parseInt(v, 10) : 0;
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(99, n));
}

export function setCompanionCount(n: number): void {
	sessionStorage.setItem(
		K.companionCount,
		String(Math.max(0, Math.min(99, n))),
	);
}

export function isCheckInDone(): boolean {
	return sessionStorage.getItem(K.checkinDone) === "1";
}

export function setCheckInDone(v: boolean): void {
	sessionStorage.setItem(K.checkinDone, v ? "1" : "0");
}

/** 與線框／專案文件「關卡地點」順序一致（場勘後可再調） */
const STAGE_NAMES: Record<number, string> = {
	1: "天鵝湖",
	2: "可愛動物區",
	3: "雨林空中步道",
	4: "羊駝之家",
	5: "蝴蝶生態公園",
	6: "鳥類生態公園",
};

export function stageTitle(n: number): string {
	return STAGE_NAMES[n] ?? `第 ${n} 站`;
}

/** 完成報到頁主視覺（`public/images/`） */
export const CHECKIN_COMPLETE_STICKER_SRC =
	"/images/checkin-complete-familyday-scene.png" as const;

/** 關卡頁主視覺（森林探索扁平插畫，`public/images/`） */
export const STAGE_PAGE_HERO_SRC =
	"/images/stage-hero-forest-exploration-flat.png" as const;

/** 闖關完成頁主視覺（慶典森林扁平插畫，與過關中頁面區隔，`public/images/`） */
export const FINISH_PAGE_HERO_SRC =
	"/images/stage-hero-festive-forest-flat.png" as const;

/** 關卡貼圖（`public/images/stages/`），與 STAGE_NAMES 順序一致 */
export function stageStickerSrc(n: number): string {
	if (n < GAME_CONFIG.MIN_STAGE || n > GAME_CONFIG.TOTAL_STAGES) return "";
	return `/images/stages/stage-${String(n).padStart(2, "0")}.png`;
}

export function stageIds(): number[] {
	return Array.from({ length: GAME_CONFIG.TOTAL_STAGES }, (_, i) => i + 1);
}
