import { describe, expect, it } from "vitest";
import { resolveResultAction } from "@/lib/resultAction";

describe("resolveResultAction", () => {
	it("答錯 → 回 quiz 重試", () => {
		expect(
			resolveResultAction({
				ok: false,
				firstClear: false,
				allCleared: false,
			}),
		).toEqual({ labelKey: "result.retryButton", target: "quiz" });
	});

	it("答錯（即使本地 allCleared）仍是 retry", () => {
		expect(
			resolveResultAction({
				ok: false,
				firstClear: false,
				allCleared: true,
			}),
		).toEqual({ labelKey: "result.retryButton", target: "quiz" });
	});

	it("答對 + 首次全破 → 領取闖關禮（/finish）", () => {
		expect(
			resolveResultAction({
				ok: true,
				firstClear: true,
				allCleared: true,
			}),
		).toEqual({ labelKey: "result.claimRewardButton", target: "finish" });
	});

	it("答對 + 已是 6/6 重玩答對 → 回關卡列表（/stage）", () => {
		expect(
			resolveResultAction({
				ok: true,
				firstClear: false,
				allCleared: true,
			}),
		).toEqual({ labelKey: "result.backToStageButton", target: "stage" });
	});

	it("答對 + 一般進度（< 6） → 前往下一關（/stage）", () => {
		expect(
			resolveResultAction({
				ok: true,
				firstClear: false,
				allCleared: false,
			}),
		).toEqual({ labelKey: "result.nextButton", target: "stage" });
	});

	it("firstClear 優先於 allCleared（互斥但保險）", () => {
		expect(
			resolveResultAction({
				ok: true,
				firstClear: true,
				allCleared: false,
			}),
		).toEqual({ labelKey: "result.claimRewardButton", target: "finish" });
	});
});
