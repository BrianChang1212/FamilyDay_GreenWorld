import { beforeEach, describe, expect, it } from "vitest";
import {
	advanceStage,
	FINISH_REWARD_SLOTS,
	getCompanionCount,
	getFinishClaimedCount,
	getInZone,
	getProfile,
	getStage,
	incrementFinishClaimed,
	isCheckInDone,
	resetScavengerRun,
	setCheckInDone,
	setCompanionCount,
	setInZone,
	setProfile,
	setStage,
	stageIds,
	stageStickerSrc,
	stageTitle,
} from "@/lib/demoState";

describe("demoState", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	describe("finish claimed", () => {
		it("incrementFinishClaimed increases until cap", () => {
			expect(getFinishClaimedCount()).toBe(0);
			expect(incrementFinishClaimed()).toBe(1);
			expect(getFinishClaimedCount()).toBe(1);
			expect(incrementFinishClaimed()).toBe(2);
			expect(incrementFinishClaimed()).toBe(3);
			expect(incrementFinishClaimed()).toBe(3);
			expect(getFinishClaimedCount()).toBe(FINISH_REWARD_SLOTS);
		});

		it("getFinishClaimedCount clamps stored garbage", () => {
			sessionStorage.setItem("fdgw_finishClaimed", "not-a-number");
			expect(getFinishClaimedCount()).toBe(0);
			sessionStorage.setItem("fdgw_finishClaimed", "99");
			expect(getFinishClaimedCount()).toBe(FINISH_REWARD_SLOTS);
		});
	});

	describe("stage", () => {
		it("defaults stage to 1", () => {
			expect(getStage()).toBe(1);
		});

		it("getStage falls back to 1 for out-of-range or non-numeric storage", () => {
			sessionStorage.setItem("fdgw_stage", "0");
			expect(getStage()).toBe(1);
			sessionStorage.setItem("fdgw_stage", "7");
			expect(getStage()).toBe(1);
			sessionStorage.setItem("fdgw_stage", "x");
			expect(getStage()).toBe(1);
		});

		it("setStage clamps to [1, 6]", () => {
			setStage(0);
			expect(getStage()).toBe(1);
			setStage(10);
			expect(getStage()).toBe(6);
			setStage(3);
			expect(getStage()).toBe(3);
		});

		it("advanceStage moves forward until 6", () => {
			setStage(1);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(2);
			expect(getInZone()).toBe(false);
			setStage(6);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(6);
		});

		it("advanceStage at last station does not clear in-zone", () => {
			setStage(6);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(6);
			expect(getInZone()).toBe(true);
		});

		it("resetScavengerRun sets stage 1 and clears in-zone", () => {
			setStage(5);
			setInZone(true);
			resetScavengerRun();
			expect(getStage()).toBe(1);
			expect(getInZone()).toBe(false);
		});
	});

	describe("stageTitle / stageStickerSrc / stageIds", () => {
		it("stageTitle returns known station or fallback", () => {
			expect(stageTitle(1)).toBe("天鵝湖");
			expect(stageTitle(99)).toBe("第 99 站");
		});

		it("stageStickerSrc returns path for valid ids only", () => {
			expect(stageStickerSrc(1)).toBe("/images/stages/stage-01.png");
			expect(stageStickerSrc(0)).toBe("");
			expect(stageStickerSrc(7)).toBe("");
		});

		it("stageIds lists six stations", () => {
			expect(stageIds()).toEqual([1, 2, 3, 4, 5, 6]);
		});
	});

	describe("inZone default and storage", () => {
		it("treats missing key as in-zone; explicit 0 as out", () => {
			expect(getInZone()).toBe(true);
			setInZone(false);
			expect(getInZone()).toBe(false);
			setInZone(true);
			expect(getInZone()).toBe(true);
		});
	});

	describe("profile", () => {
		it("setProfile trims and getProfile reads back", () => {
			setProfile("  Alice  ", "  E001 ");
			expect(getProfile()).toEqual({ name: "Alice", employeeId: "E001" });
		});
	});

	describe("companion & check-in flags", () => {
		it("companion count defaults and clamps", () => {
			expect(getCompanionCount()).toBe(1);
			setCompanionCount(50);
			expect(getCompanionCount()).toBe(50);
			setCompanionCount(0);
			expect(getCompanionCount()).toBe(1);
			setCompanionCount(200);
			expect(getCompanionCount()).toBe(99);
		});

		it("getCompanionCount treats non-finite stored value as default 1", () => {
			sessionStorage.setItem("fdgw_companionCount", "NaN");
			expect(getCompanionCount()).toBe(1);
		});

		it("check-in done flag", () => {
			expect(isCheckInDone()).toBe(false);
			setCheckInDone(true);
			expect(isCheckInDone()).toBe(true);
			setCheckInDone(false);
			expect(isCheckInDone()).toBe(false);
		});
	});
});
