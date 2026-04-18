/**
 * QR／URL 進入意圖（與 docs/project/專案文件 §2.4、summary-frontend §2.1 對齊）
 * — `checkin`／`game` 寫入 sessionStorage；報到表單為 `/checkin`，闖關登入為 `/register`（非同一頁）。
 */

export type EntryIntent = "checkin" | "game";

const STORAGE_KEY = "fdgw_entry_intent";

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
