import { describe, expect, it } from "vitest";
import {
	CHECKIN_HEADERS,
	buildCheckinCsv,
	escapeCsvCell,
	sortByCheckinAt,
	sortCheckinByEmployeeId,
	toTaipeiDateTime,
} from "../../src/scheduled/checkinCsv";

describe("checkinCsv", () => {
	it("headers match 家庭日當天資料紀錄表 報到紀錄表 sheet", () => {
		expect([...CHECKIN_HEADERS]).toEqual([
			"工號",
			"姓名",
			"報到時間",
			"攜伴人數(不含本人)",
		]);
	});

	it("converts ISO UTC to Asia/Taipei (UTC+8) datetime", () => {
		// 2026-06-04T00:30:00Z → 台北 08:30:00 同日
		expect(toTaipeiDateTime("2026-06-04T00:30:00.000Z")).toBe(
			"2026-06-04 08:30:00",
		);
		// 跨日：UTC 23:00 → 台北隔日 07:00
		expect(toTaipeiDateTime("2026-06-03T23:00:00.000Z")).toBe(
			"2026-06-04 07:00:00",
		);
	});

	it("toTaipeiDateTime handles empty / invalid", () => {
		expect(toTaipeiDateTime("")).toBe("");
		expect(toTaipeiDateTime(undefined)).toBe("");
		expect(toTaipeiDateTime("not-a-date")).toBe("not-a-date");
	});

	it("escapes commas, quotes and newlines per RFC4180", () => {
		expect(escapeCsvCell("a,b")).toBe('"a,b"');
		expect(escapeCsvCell('he said "hi"')).toBe('"he said ""hi"""');
		expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
		expect(escapeCsvCell(0)).toBe("0");
		expect(escapeCsvCell(null)).toBe("");
	});

	it("buildCheckinCsv outputs header + mapped rows in column order", () => {
		const csv = buildCheckinCsv([
			{
				employeeId: "8411007",
				name: "吳春發",
				checkinAt: "2026-06-04T01:00:00.000Z",
				partySize: 0,
			},
			{
				employeeId: "1141157",
				name: "王, 小明",
				checkinAt: "2026-06-04T02:15:30.000Z",
				partySize: 2,
			},
		]);
		const lines = csv.split("\r\n");
		expect(lines[0]).toBe("工號,姓名,報到時間,攜伴人數(不含本人)");
		expect(lines[1]).toBe("8411007,吳春發,2026-06-04 09:00:00,0");
		// 姓名含逗號 → 需加引號
		expect(lines[2]).toBe('1141157,"王, 小明",2026-06-04 10:15:30,2');
	});

	it("buildCheckinCsv returns header only for empty input", () => {
		expect(buildCheckinCsv([])).toBe("工號,姓名,報到時間,攜伴人數(不含本人)");
	});

	it("sortByCheckinAt sorts ascending and does not mutate input", () => {
		const input = [
			{ employeeId: "b", checkinAt: "2026-06-04T03:00:00Z" },
			{ employeeId: "a", checkinAt: "2026-06-04T01:00:00Z" },
		];
		const sorted = sortByCheckinAt(input);
		expect(sorted.map((r) => r.employeeId)).toEqual(["a", "b"]);
		expect(input[0].employeeId).toBe("b"); // 原陣列不變
	});

	it("sortCheckinByEmployeeId sorts numerically ascending and does not mutate input", () => {
		// 數字排序：1141157 < 8411007，即使報到時間順序相反
		const input = [
			{ employeeId: "8411007", checkinAt: "2026-06-04T01:00:00Z" },
			{ employeeId: "1141157", checkinAt: "2026-06-04T03:00:00Z" },
		];
		const sorted = sortCheckinByEmployeeId(input);
		expect(sorted.map((r) => r.employeeId)).toEqual(["1141157", "8411007"]);
		expect(input[0].employeeId).toBe("8411007"); // 原陣列不變
	});
});
