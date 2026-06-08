/**
 * Pure orchestration for the daily 「家庭日當天資料紀錄表」匯出：把已取出的
 * checkins / player_progress 文件 + roster 姓名對照表，組裝成 email 主旨、內文與
 * 兩個 CSV 附件（報到紀錄表 + 闖關遊戲紀錄表）。
 *
 * 不含 Firebase / nodemailer，純資料轉換，便於單元測試此「匯出操作」。
 * I/O（讀 Firestore、寄信）留在 dumpCheckins.ts 的 onSchedule handler。
 */
import { buildCheckinCsv, sortCheckinByEmployeeId, type CheckinDoc } from "./checkinCsv";
import {
	buildProgressCsv,
	sortByEmployeeId,
	type ProgressRow,
} from "./progressCsv";

/** player_progress 原始文件（doc id = employeeId） */
export type ProgressDocInput = {
	employeeId: string;
	rewardRedeemCount?: unknown;
	rewardRedeemAt?: unknown;
};

export type DailyDumpInput = {
	/** 台北時區 YYYY-MM-DD，用於主旨／檔名 */
	dateStr: string;
	checkins: CheckinDoc[];
	progressDocs: ProgressDocInput[];
	/** 員編 → 姓名（player_progress 無姓名，由 roster join） */
	rosterNameMap: Map<string, string>;
};

export type DumpAttachment = { filename: string; csv: string };

export type DailyDumpReport = {
	subject: string;
	text: string;
	checkinCount: number;
	progressCount: number;
	attachments: DumpAttachment[];
};

/** player_progress 原始文件 → 闖關遊戲紀錄表列（姓名 join、次數正規化） */
function toProgressRow(
	doc: ProgressDocInput,
	nameMap: Map<string, string>,
): ProgressRow {
	return {
		employeeId: doc.employeeId,
		name: nameMap.get(doc.employeeId) ?? "",
		rewardRedeemCount: Math.max(0, Math.floor(Number(doc.rewardRedeemCount) || 0)),
		rewardRedeemAt: Array.isArray(doc.rewardRedeemAt)
			? (doc.rewardRedeemAt as unknown[]).map((x) => String(x ?? ""))
			: [],
	};
}

export function buildDailyDumpReport(input: DailyDumpInput): DailyDumpReport {
	const { dateStr } = input;

	// Sheet 1「報到紀錄表」← checkins（依工號升冪排序）
	const checkinRows = sortCheckinByEmployeeId(input.checkins);
	const checkinCsv = buildCheckinCsv(checkinRows);

	// Sheet 2「闖關遊戲紀錄表」← player_progress（姓名 join roster，依工號排序）
	const progressRows = sortByEmployeeId(
		input.progressDocs.map((d) => toProgressRow(d, input.rosterNameMap)),
	);
	const progressCsv = buildProgressCsv(progressRows);

	const checkinCount = checkinRows.length;
	const progressCount = progressRows.length;

	return {
		subject: `[FamilyDay] 當天資料紀錄 每日匯出 ${dateStr}（報到 ${checkinCount}／闖關 ${progressCount}）`,
		text:
			`FamilyDay GreenWorld 當天資料紀錄每日自動匯出。\n` +
			`日期：${dateStr}（Asia/Taipei）\n` +
			`報到紀錄：${checkinCount} 筆（來源：checkins）\n` +
			`闖關遊戲紀錄：${progressCount} 筆（來源：player_progress）\n\n` +
			`附件含真實個資，請維持內部使用、勿外流。`,
		checkinCount,
		progressCount,
		attachments: [
			{ filename: `報到紀錄表-${dateStr}.csv`, csv: checkinCsv },
			{ filename: `闖關遊戲紀錄表-${dateStr}.csv`, csv: progressCsv },
		],
	};
}
