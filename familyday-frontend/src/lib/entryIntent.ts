import { STORAGE_KEYS } from "@/constants";

/**
 * QR／URL 進入意圖（與 docs/project/專案文件 §2.4、summary-frontend §2.1 對齊）
 * — `checkin`／`game` 寫入 sessionStorage；報到第一屏為 `/checkin/welcome`，表單為 `/checkin`；闖關登入為 `/register`。
 */

export type EntryIntent = "checkin" | "game";

const STORAGE_KEY = STORAGE_KEYS.entryIntent;
const WELCOME_PASSED_KEY = STORAGE_KEYS.checkinWelcomePassed;

export function setEntryIntent(intent: EntryIntent): void {
	sessionStorage.setItem(STORAGE_KEY, intent);
}

export function getEntryIntent(): EntryIntent | null {
	const v = sessionStorage.getItem(STORAGE_KEY);
	if (v === "checkin" || v === "game") return v;
	return null;
}

export function clearEntryIntent(): void {
	sessionStorage.removeItem(STORAGE_KEY);
}

export function normalizeQueryEntry(raw: unknown): EntryIntent | null {
	if (raw === "checkin" || raw === "game") return raw;
	return null;
}

export function isCheckinWelcomePassed(): boolean {
	return sessionStorage.getItem(WELCOME_PASSED_KEY) === "1";
}

export function setCheckinWelcomePassed(v: boolean): void {
	sessionStorage.setItem(WELCOME_PASSED_KEY, v ? "1" : "0");
}

export function clearCheckinWelcomePassed(): void {
	sessionStorage.removeItem(WELCOME_PASSED_KEY);
}
