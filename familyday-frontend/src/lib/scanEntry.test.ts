import { describe, expect, it } from "vitest";
import { resolveScanIntent } from "@/lib/scanEntry";

const STAGING_JWT_STAGE_2 =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFnZUlkIjoyLCJpc3MiOiJmYW1pbHlkYXktMjAyNiIsImlhdCI6MTc3OTE4MjM1Mn0.r4FPJv-mhlipM_kLIeqBvXK6elPr4CxoPLWG-B0chNw";

describe("resolveScanIntent", () => {
	it("解 JWT 取得 stage 與 challengeId", () => {
		expect(resolveScanIntent({ t: STAGING_JWT_STAGE_2 })).toEqual({
			type: "valid",
			stageId: 2,
			challengeId: "c2",
		});
	});

	it("解 mock token", () => {
		expect(resolveScanIntent({ t: "stage-5-token" })).toEqual({
			type: "valid",
			stageId: 5,
			challengeId: "c5",
		});
	});

	it("解明文 stage query", () => {
		expect(resolveScanIntent({ stage: "3" })).toEqual({
			type: "valid",
			stageId: 3,
			challengeId: "c3",
		});
	});

	it("t 解析失敗時 fallback 到 stage", () => {
		expect(resolveScanIntent({ t: "garbage", stage: "4" })).toEqual({
			type: "valid",
			stageId: 4,
			challengeId: "c4",
		});
	});

	it("兩者皆無 → invalid", () => {
		expect(resolveScanIntent({})).toEqual({ type: "invalid" });
	});

	it("out-of-range stage → invalid", () => {
		expect(resolveScanIntent({ stage: "9" })).toEqual({ type: "invalid" });
	});

	it("非字串型別忽略", () => {
		expect(resolveScanIntent({ t: 123, stage: ["1"] })).toEqual({
			type: "invalid",
		});
	});
});
