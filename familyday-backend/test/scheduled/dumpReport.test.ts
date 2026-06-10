import { describe, expect, it } from "vitest";
import { buildDailyDumpReport } from "../../src/scheduled/dumpReport";

const DATE = "2026-06-04";

describe("buildDailyDumpReport (每日匯出操作)", () => {
	it("produces subject, four named CSV attachments, and counts", () => {
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [
				{
					employeeId: "8411007",
					name: "吳春發",
					checkinAt: "2026-06-04T01:00:00.000Z",
					partySize: 0,
				},
			],
			progressDocs: [
				{
					employeeId: "8411007",
					rewardRedeemCount: 1,
					rewardRedeemAt: ["2026-06-04T02:00:00.000Z"],
				},
			],
			rosterNameMap: new Map([["8411007", "吳春發"]]),
		});

		expect(report.subject).toBe(
			"[FamilyDay] 當天資料紀錄 每日匯出 2026-06-04（報到 1+瑞旭通 0／闖關 1+瑞旭通 0）",
		);
		expect(report.checkinCount).toBe(1);
		expect(report.progressCount).toBe(1);
		expect(report.ruixuCheckinCount).toBe(0);
		expect(report.ruixuProgressCount).toBe(0);
		expect(report.attachments.map((a) => a.filename)).toEqual([
			"報到紀錄表-2026-06-04.csv",
			"闖關遊戲紀錄表-2026-06-04.csv",
			"報到紀錄表-瑞旭通-2026-06-04.csv",
			"闖關遊戲紀錄表-瑞旭通-2026-06-04.csv",
		]);
	});

	it("瑞旭通 員編互斥拆分：主檔排除瑞旭通、瑞旭通只進專屬附件", () => {
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [
				// AMTran
				{ employeeId: "1141157", name: "王小明", checkinAt: "2026-06-04T01:00:00Z", partySize: 2 },
				// 瑞旭通（300xxx 與 7 碼 1003003 各一）
				{ employeeId: "300025", name: "簡俊誠", checkinAt: "2026-06-04T02:00:00Z", partySize: 1 },
				{ employeeId: "1003003", name: "吳旭祐", checkinAt: "2026-06-04T03:00:00Z", partySize: 0 },
			],
			progressDocs: [
				{ employeeId: "1141157", rewardRedeemCount: 1, rewardRedeemAt: ["2026-06-04T04:00:00Z"] },
				{ employeeId: "300025", rewardRedeemCount: 2, rewardRedeemAt: ["2026-06-04T05:00:00Z", "2026-06-04T06:00:00Z"] },
			],
			rosterNameMap: new Map([
				["1141157", "王小明"],
				["300025", "簡俊誠"],
				["1003003", "吳旭祐"],
			]),
		});

		expect(report.checkinCount).toBe(1); // 主檔只剩 AMTran 1 筆
		expect(report.ruixuCheckinCount).toBe(2); // 瑞旭通 2 筆
		expect(report.progressCount).toBe(1);
		expect(report.ruixuProgressCount).toBe(1);
		expect(report.subject).toContain("（報到 1+瑞旭通 2／闖關 1+瑞旭通 1）");

		const [mainCheckin, mainProgress, ruixuCheckin, ruixuProgress] =
			report.attachments;
		// 主報到表：只有 1141157，無任何瑞旭通員編
		expect(mainCheckin.csv).toContain("1141157,王小明");
		expect(mainCheckin.csv).not.toContain("300025");
		expect(mainCheckin.csv).not.toContain("1003003");
		// 瑞旭通報到表：依工號升冪 → 1003003 在 300025 後（數字較大）
		const rcLines = ruixuCheckin.csv.split("\r\n");
		expect(rcLines[1]).toBe("300025,簡俊誠,2026-06-04 10:00:00,1");
		expect(rcLines[2]).toBe("1003003,吳旭祐,2026-06-04 11:00:00,0");
		// 主闖關表只有 AMTran；瑞旭通闖關表只有 300025
		expect(mainProgress.csv).toContain("1141157");
		expect(mainProgress.csv).not.toContain("300025");
		expect(ruixuProgress.csv).toContain("300025,簡俊誠,2");
		expect(ruixuProgress.csv).not.toContain("1141157");
	});

	it("checkins → 報到紀錄表 CSV：依工號數字升冪排序、台北時間", () => {
		// 8411007 報到時間較早，但工號較大 → 應排在 1141157 後面
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [
				{ employeeId: "8411007", name: "吳春發", checkinAt: "2026-06-04T01:00:00Z", partySize: 0 },
				{ employeeId: "1141157", name: "王小明", checkinAt: "2026-06-04T03:00:00Z", partySize: 2 },
			],
			progressDocs: [],
			rosterNameMap: new Map(),
		});
		const lines = report.attachments[0].csv.split("\r\n");
		expect(lines[0]).toBe("工號,姓名,報到時間,攜伴人數(不含本人)");
		expect(lines[1]).toBe("1141157,王小明,2026-06-04 11:00:00,2"); // 工號小的排前
		expect(lines[2]).toBe("8411007,吳春發,2026-06-04 09:00:00,0");
	});

	it("player_progress → 闖關遊戲紀錄表：姓名由 roster join、依工號排序、領獎時間轉台北", () => {
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [],
			progressDocs: [
				{
					employeeId: "8411007",
					rewardRedeemCount: 2,
					rewardRedeemAt: ["2026-06-04T01:00:00Z", "2026-06-04T02:00:00Z"],
				},
				{ employeeId: "1141157", rewardRedeemCount: 0, rewardRedeemAt: [] },
			],
			// 1141157 不在 roster → 姓名留空；8411007 有姓名
			rosterNameMap: new Map([["8411007", "吳春發"]]),
		});
		const lines = report.attachments[1].csv.split("\r\n");
		expect(lines[0]).toBe("工號,姓名,領獎次數,領獎時間一,領獎時間二,領獎時間三");
		// 依工號升冪：1141157 在前
		expect(lines[1]).toBe("1141157,,0,,,");
		expect(lines[2]).toBe("8411007,吳春發,2,2026-06-04 09:00:00,2026-06-04 10:00:00,");
	});

	it("coerces missing/invalid rewardRedeemCount and rewardRedeemAt", () => {
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [],
			progressDocs: [
				// rewardRedeemCount 缺 → 0；rewardRedeemAt 非陣列 → []
				{ employeeId: "x" },
				{ employeeId: "y", rewardRedeemCount: "3" as unknown, rewardRedeemAt: null },
			],
			rosterNameMap: new Map(),
		});
		const lines = report.attachments[1].csv.split("\r\n");
		expect(lines[1]).toBe("x,,0,,,");
		expect(lines[2]).toBe("y,,3,,,"); // "3" → 3
	});

	it("empty collections → header-only CSVs and zero counts", () => {
		const report = buildDailyDumpReport({
			dateStr: DATE,
			checkins: [],
			progressDocs: [],
			rosterNameMap: new Map(),
		});
		expect(report.checkinCount).toBe(0);
		expect(report.progressCount).toBe(0);
		expect(report.ruixuCheckinCount).toBe(0);
		expect(report.ruixuProgressCount).toBe(0);
		// 仍固定產出 4 份附件，皆為 header-only
		expect(report.attachments).toHaveLength(4);
		const checkinHeader = "工號,姓名,報到時間,攜伴人數(不含本人)";
		const progressHeader = "工號,姓名,領獎次數,領獎時間一,領獎時間二,領獎時間三";
		expect(report.attachments[0].csv).toBe(checkinHeader); // 主報到
		expect(report.attachments[1].csv).toBe(progressHeader); // 主闖關
		expect(report.attachments[2].csv).toBe(checkinHeader); // 瑞旭通報到
		expect(report.attachments[3].csv).toBe(progressHeader); // 瑞旭通闖關
		expect(report.subject).toContain("報到 0+瑞旭通 0／闖關 0+瑞旭通 0");
	});
});
