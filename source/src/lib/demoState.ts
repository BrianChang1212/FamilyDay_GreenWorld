const K = {
	stage: "fdgw_stage",
	name: "fdgw_name",
	employeeId: "fdgw_employeeId",
	inZone: "fdgw_inZone",
	/** 完成頁已領取次數 0–3 */
	finishClaimed: "fdgw_finishClaimed",
	/** 現場報到：同行人數（原型暫存） */
	companionCount: "fdgw_companionCount",
	/** 現場報到：是否已完成送出（原型；與闖關流程分離） */
	checkinDone: "fdgw_checkin_done",
} as const;

/** 保證領獎機會總次數（與完成頁 UI 一致） */
export const FINISH_REWARD_SLOTS = 3;

export function getFinishClaimedCount(): number {
	const v = sessionStorage.getItem(K.finishClaimed);
	const n = v ? parseInt(v, 10) : 0;
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(FINISH_REWARD_SLOTS, n));
}

export function setFinishClaimedCount(n: number): void {
	sessionStorage.setItem(
		K.finishClaimed,
		String(Math.max(0, Math.min(FINISH_REWARD_SLOTS, n))),
	);
}

export function getStage(): number {
	const v = sessionStorage.getItem(K.stage);
	const n = v ? parseInt(v, 10) : 1;
	return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
}

export function setStage(n: number): void {
	sessionStorage.setItem(K.stage, String(Math.min(6, Math.max(1, n))));
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

export function resetDemo(): void {
	sessionStorage.removeItem(K.stage);
	sessionStorage.removeItem(K.name);
	sessionStorage.removeItem(K.employeeId);
	sessionStorage.removeItem(K.inZone);
	sessionStorage.removeItem(K.finishClaimed);
	sessionStorage.removeItem(K.companionCount);
	sessionStorage.removeItem(K.checkinDone);
}

/** 與設計稿「闖關路線」站名一致 */
const STAGE_NAMES: Record<number, string> = {
	1: "天鵝湖",
	2: "青青草原",
	3: "森林小徑",
	4: "松鼠之家",
	5: "昆蟲飯店",
	6: "終點舞台",
};

export function stageTitle(n: number): string {
	return STAGE_NAMES[n] ?? `第 ${n} 站`;
}

export function stageIds(): number[] {
	return [1, 2, 3, 4, 5, 6];
}
