import { describe, expect, it } from "vitest";
import { buildDailyDumpReport } from "../../src/scheduled/dumpReport";

const DATE = "2026-06-04";

describe("buildDailyDumpReport (每日匯出操作)", () => {
	it("produces subject, two named CSV attachments, and counts", () => {
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
			"[FamilyDay] 當天資料紀錄 每日匯出 2026-06-04（報到 1／闖關 1）",
		);
		expect(report.checkinCount).toBe(1);
		expect(report.progressCount).toBe(1);
		expect(report.attachments.map((a) => a.filename)).toEqual([
			"報到紀錄表-2026-06-04.csv",
			"闖關遊戲紀錄表-2026-06-04.csv",
		]);
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
		expect(report.attachments[0].csv).toBe("工號,姓名,報到時間,攜伴人數(不含本人)");
		expect(report.attachments[1].csv).toBe(
			"工號,姓名,領獎次數,領獎時間一,領獎時間二,領獎時間三",
		);
		expect(report.subject).toContain("報到 0／闖關 0");
	});
});
