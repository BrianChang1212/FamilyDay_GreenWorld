import { describe, expect, it } from "vitest";
import {
	PROGRESS_HEADERS,
	buildProgressCsv,
	sortByEmployeeId,
} from "../../src/scheduled/progressCsv";

describe("progressCsv", () => {
	it("headers match 家庭日當天資料紀錄表 闖關遊戲紀錄表 sheet", () => {
		expect([...PROGRESS_HEADERS]).toEqual([
			"工號",
			"姓名",
			"領獎次數",
			"領獎時間一",
			"領獎時間二",
			"領獎時間三",
		]);
	});

	it("maps rewardRedeemAt[] into 三個領獎時間欄並轉台北時間", () => {
		const csv = buildProgressCsv([
			{
				employeeId: "8411007",
				name: "吳春發",
				rewardRedeemCount: 2,
				rewardRedeemAt: ["2026-06-04T01:00:00.000Z", "2026-06-04T02:00:00.000Z"],
			},
		]);
		const lines = csv.split("\r\n");
		expect(lines[0]).toBe("工號,姓名,領獎次數,領獎時間一,領獎時間二,領獎時間三");
		// 第三格（領獎時間三）無資料 → 空白
		expect(lines[1]).toBe(
			"8411007,吳春發,2,2026-06-04 09:00:00,2026-06-04 10:00:00,",
		);
	});

	it("0 次領獎 → 三個時間欄皆空", () => {
		const csv = buildProgressCsv([
			{ employeeId: "1141157", name: "王小明", rewardRedeemCount: 0, rewardRedeemAt: [] },
		]);
		expect(csv.split("\r\n")[1]).toBe("1141157,王小明,0,,,");
	});

	it("超過 3 次只輸出前三個時間欄", () => {
		const csv = buildProgressCsv([
			{
				employeeId: "x",
				name: "n",
				rewardRedeemCount: 4,
				rewardRedeemAt: [
					"2026-06-04T00:00:00Z",
					"2026-06-04T01:00:00Z",
					"2026-06-04T02:00:00Z",
					"2026-06-04T03:00:00Z",
				],
			},
		]);
		const cells = csv.split("\r\n")[1].split(",");
		expect(cells).toHaveLength(6); // 工號,姓名,次數,時間一,二,三
		expect(cells[5]).toBe("2026-06-04 10:00:00"); // 領獎時間三 = 第三筆
	});

	it("returns header only for empty input", () => {
		expect(buildProgressCsv([])).toBe(
			"工號,姓名,領獎次數,領獎時間一,領獎時間二,領獎時間三",
		);
	});

	it("sortByEmployeeId sorts ascending and does not mutate input", () => {
		const input = [
			{ employeeId: "b", name: "", rewardRedeemCount: 0, rewardRedeemAt: [] },
			{ employeeId: "a", name: "", rewardRedeemCount: 0, rewardRedeemAt: [] },
		];
		expect(sortByEmployeeId(input).map((r) => r.employeeId)).toEqual(["a", "b"]);
		expect(input[0].employeeId).toBe("b");
	});
});
