/**
 * Pure helpers for the daily 闖關遊戲紀錄表 CSV — no Firebase/SDK imports so they
 * are unit-testable. Columns align with 「家庭日當天資料紀錄表.xlsx」sheet
 * 「闖關遊戲紀錄表」：
 *   工號 / 姓名 / 領獎次數 / 領獎時間一 / 領獎時間二 / 領獎時間三
 *
 * 資料來源：`player_progress`（領獎次數＝rewardRedeemCount、領獎時間＝rewardRedeemAt[]），
 * 姓名由 roster 依員編 join。
 */
import { escapeCsvCell, toTaipeiDateTime } from "./checkinCsv";

export const PROGRESS_HEADERS = [
	"工號",
	"姓名",
	"領獎次數",
	"領獎時間一",
	"領獎時間二",
	"領獎時間三",
] as const;

/** 領獎時間欄位數（對齊 maxRounds = 3） */
export const REDEEM_TIME_SLOTS = 3;

export type ProgressRow = {
	employeeId: string;
	name: string;
	rewardRedeemCount: number;
	/** 每次領獎成功的 ISO 時間字串，長度 = rewardRedeemCount */
	rewardRedeemAt: string[];
};

/** 依「闖關遊戲紀錄表」欄序產生 CSV 內文（不含 BOM）；領獎時間轉台北時間 */
export function buildProgressCsv(rows: ProgressRow[]): string {
	const header = PROGRESS_HEADERS.map(escapeCsvCell).join(",");
	const body = rows
		.map((r) => {
			const at = Array.isArray(r.rewardRedeemAt) ? r.rewardRedeemAt : [];
			const slots = Array.from({ length: REDEEM_TIME_SLOTS }, (_, i) =>
				escapeCsvCell(toTaipeiDateTime(at[i])),
			);
			return [
				escapeCsvCell(r.employeeId),
				escapeCsvCell(r.name),
				escapeCsvCell(r.rewardRedeemCount),
				...slots,
			].join(",");
		})
		.join("\r\n");
	return body ? `${header}\r\n${body}` : header;
}

/** 依工號升冪排序，回傳新陣列 */
export function sortByEmployeeId(rows: ProgressRow[]): ProgressRow[] {
	return [...rows].sort((a, b) =>
		String(a.employeeId).localeCompare(String(b.employeeId)),
	);
}
