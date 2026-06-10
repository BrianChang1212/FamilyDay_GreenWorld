import { describe, expect, it } from "vitest";
import { shouldLookupEmployeeId } from "./employeeId";

describe("shouldLookupEmployeeId", () => {
	it("瑞旭通 6 碼員編 (300xxx) 應觸發查詢（回歸：曾因 < 7 被擋）", () => {
		expect(shouldLookupEmployeeId("300025")).toBe(true);
		expect(shouldLookupEmployeeId("300323")).toBe(true);
	});

	it("AMTran 7 碼員編應觸發查詢", () => {
		expect(shouldLookupEmployeeId("1141157")).toBe(true);
		expect(shouldLookupEmployeeId("1003003")).toBe(true); // 瑞旭通唯一 7 碼
	});

	it("不足 6 碼不觸發（避免逐字查詢）", () => {
		expect(shouldLookupEmployeeId("")).toBe(false);
		expect(shouldLookupEmployeeId("3")).toBe(false);
		expect(shouldLookupEmployeeId("30002")).toBe(false); // 5 碼
	});

	it("trim 後計長度（前後空白不算）", () => {
		expect(shouldLookupEmployeeId("  300025  ")).toBe(true);
		expect(shouldLookupEmployeeId("  3000  ")).toBe(false); // trim 後 4 碼
	});
});
