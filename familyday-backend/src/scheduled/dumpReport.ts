/**
 * Pure orchestration for the daily 「家庭日當天資料紀錄表」匯出：把已取出的
 * checkins / player_progress 文件 + roster 姓名對照表，組裝成 email 主旨、內文與
 * CSV 附件。
 *
 * 瑞旭通（子公司）紀錄「互斥拆分」：主檔（報到紀錄表 / 闖關遊戲紀錄表）排除瑞旭通，
 * 瑞旭通另出專屬兩份，共 4 份附件。瑞旭通辨識依 config/ruixu.ts 的固定員編清單。
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
import { isRuixuEmployee } from "../config/ruixu";

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
	/** 主檔（AMTran，排除瑞旭通）報到筆數 */
	checkinCount: number;
	/** 主檔（AMTran，排除瑞旭通）闖關筆數 */
	progressCount: number;
	/** 瑞旭通專屬報到筆數 */
	ruixuCheckinCount: number;
	/** 瑞旭通專屬闖關筆數 */
	ruixuProgressCount: number;
	/** 順序固定：主報到、主闖關、瑞旭通報到、瑞旭通闖關（共 4 份） */
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

	// 互斥拆分：主檔（AMTran）排除瑞旭通，瑞旭通另出專屬兩份
	const mainCheckins = input.checkins.filter((c) => !isRuixuEmployee(c.employeeId));
	const ruixuCheckins = input.checkins.filter((c) => isRuixuEmployee(c.employeeId));
	const mainProgress = input.progressDocs.filter((d) => !isRuixuEmployee(d.employeeId));
	const ruixuProgress = input.progressDocs.filter((d) => isRuixuEmployee(d.employeeId));

	// 「報到紀錄表」← checkins（依工號升冪排序）
	const buildCheckin = (rows: CheckinDoc[]) =>
		buildCheckinCsv(sortCheckinByEmployeeId(rows));
	// 「闖關遊戲紀錄表」← player_progress（姓名 join roster，依工號排序）
	const buildProgress = (rows: ProgressDocInput[]) =>
		buildProgressCsv(
			sortByEmployeeId(rows.map((d) => toProgressRow(d, input.rosterNameMap))),
		);

	const checkinCount = mainCheckins.length;
	const progressCount = mainProgress.length;
	const ruixuCheckinCount = ruixuCheckins.length;
	const ruixuProgressCount = ruixuProgress.length;

	return {
		subject:
			`[FamilyDay] 當天資料紀錄 每日匯出 ${dateStr}` +
			`（報到 ${checkinCount}+瑞旭通 ${ruixuCheckinCount}／闖關 ${progressCount}+瑞旭通 ${ruixuProgressCount}）`,
		text:
			`FamilyDay GreenWorld 當天資料紀錄每日自動匯出。\n` +
			`日期：${dateStr}（Asia/Taipei）\n` +
			`報到紀錄（來源：checkins）：AMTran ${checkinCount} 筆／瑞旭通 ${ruixuCheckinCount} 筆\n` +
			`闖關遊戲紀錄（來源：player_progress）：AMTran ${progressCount} 筆／瑞旭通 ${ruixuProgressCount} 筆\n` +
			`瑞旭通名單已互斥拆分為獨立附件（檔名含「瑞旭通」）。\n\n` +
			`附件含真實個資，請維持內部使用、勿外流。`,
		checkinCount,
		progressCount,
		ruixuCheckinCount,
		ruixuProgressCount,
		attachments: [
			{ filename: `報到紀錄表-${dateStr}.csv`, csv: buildCheckin(mainCheckins) },
			{ filename: `闖關遊戲紀錄表-${dateStr}.csv`, csv: buildProgress(mainProgress) },
			{ filename: `報到紀錄表-瑞旭通-${dateStr}.csv`, csv: buildCheckin(ruixuCheckins) },
			{ filename: `闖關遊戲紀錄表-瑞旭通-${dateStr}.csv`, csv: buildProgress(ruixuProgress) },
		],
	};
}
