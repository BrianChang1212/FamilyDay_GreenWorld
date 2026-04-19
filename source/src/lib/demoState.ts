import { FINISH_REWARD_SLOTS } from "@/lib/constants/finishReward";
import { GAME_CONFIG, STORAGE_KEYS } from "@/constants";

export { FINISH_REWARD_SLOTS };

const K = {
	stage: STORAGE_KEYS.stage,
	name: STORAGE_KEYS.name,
	employeeId: STORAGE_KEYS.employeeId,
	inZone: STORAGE_KEYS.inZone,
	/** 完成頁已領取次數 0–3 */
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
 * 從歡迎頁／遊戲說明／註冊再次進入闖關時重置進度，避免沿用上一輪 session 的關卡（例如仍停在第 6 關）。
 * 不會清除姓名、員編、報到或領獎次數。
 */
export function resetScavengerRun(): void {
	setStage(GAME_CONFIG.MIN_STAGE);
	setInZone(false);
}

/** 答對後前進一站並重置到站狀態（最後一站不遞增） */
export function advanceStage(): void {
	const s = getStage();
	if (s < GAME_CONFIG.TOTAL_STAGES) {
		setStage(s + 1);
		setInZone(false);
	}
}

export function getInZone(): boolean {
	return sessionStorage.getItem(K.inZone) !== "0";
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
	const n = v ? parseInt(v, 10) : 1;
	if (!Number.isFinite(n)) return 1;
	return Math.max(1, Math.min(99, n));
}

export function setCompanionCount(n: number): void {
	sessionStorage.setItem(
		K.companionCount,
		String(Math.max(1, Math.min(99, n))),
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
	2: "大探奇區",
	3: "水生植物公園",
	4: "鳥園",
	5: "蝴蝶園",
	6: "生物多樣性探索區",
};

export function stageTitle(n: number): string {
	return STAGE_NAMES[n] ?? `第 ${n} 站`;
}

/** 恭喜完成所有關卡／慶祝主視覺（`public/images/`） */
export const LEVEL_COMPLETE_STICKER_SRC =
	"/images/level-complete-celebration.png" as const;

/** 領取成功頁專用主視覺（禮品／兌換成功意象，`public/images/`） */
export const CLAIM_SUCCESS_STICKER_SRC =
	"/images/claim-success-sticker.png" as const;

/** 掃描 QR code 全屏示意貼圖（`public/images/`） */
export const QR_SCAN_STICKER_SRC = "/images/qr-scan-sticker.png" as const;

/** 完成報到頁主視覺（`public/images/`） */
export const CHECKIN_COMPLETE_STICKER_SRC =
	"/images/checkin-complete-sticker.png" as const;

/** 關卡貼圖（`public/images/stages/`），與 STAGE_NAMES 順序一致 */
export function stageStickerSrc(n: number): string {
	if (n < GAME_CONFIG.MIN_STAGE || n > GAME_CONFIG.TOTAL_STAGES) return "";
	return `/images/stages/stage-${String(n).padStart(2, "0")}.png`;
}

export function stageIds(): number[] {
	return Array.from({ length: GAME_CONFIG.TOTAL_STAGES }, (_, i) => i + 1);
}
