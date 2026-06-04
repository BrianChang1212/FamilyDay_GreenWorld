/**
 * Pure helpers for the daily checkins CSV — no Firebase/SDK imports so they are
 * unit-testable. Columns align with 「家庭日當天資料紀錄表.xlsx」sheet「報到紀錄表」：
 *   工號 / 姓名 / 報到時間 / 攜伴人數(不含本人)
 */

export const CHECKIN_HEADERS = [
	"工號",
	"姓名",
	"報到時間",
	"攜伴人數(不含本人)",
] as const;

export type CheckinDoc = {
	employeeId?: unknown;
	name?: unknown;
	checkinAt?: unknown;
	partySize?: unknown;
};

export function escapeCsvCell(value: unknown): string {
	if (value === null || value === undefined) return "";
	const s = String(value);
	if (/[",\r\n]/.test(s)) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
}

/** ISO 字串 → 台北時間「YYYY-MM-DD HH:mm:ss」；非法值原樣回傳、空值回空字串 */
export function toTaipeiDateTime(iso: unknown): string {
	if (typeof iso !== "string" || !iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Taipei",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).formatToParts(d);
	const get = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
	return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** 依「家庭日當天資料紀錄表」報到紀錄表欄序產生 CSV 內文（不含 BOM） */
export function buildCheckinCsv(rows: CheckinDoc[]): string {
	const header = CHECKIN_HEADERS.map(escapeCsvCell).join(",");
	const body = rows
		.map((r) =>
			[
				escapeCsvCell(r.employeeId),
				escapeCsvCell(r.name),
				escapeCsvCell(toTaipeiDateTime(r.checkinAt)),
				escapeCsvCell(r.partySize),
			].join(","),
		)
		.join("\r\n");
	return body ? `${header}\r\n${body}` : header;
}

/** 依報到時間（ISO 字串）升冪排序，回傳新陣列 */
export function sortByCheckinAt(rows: CheckinDoc[]): CheckinDoc[] {
	return [...rows].sort((a, b) =>
		String(a.checkinAt ?? "").localeCompare(String(b.checkinAt ?? "")),
	);
}
