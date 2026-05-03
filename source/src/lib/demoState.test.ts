import { beforeEach, describe, expect, it } from "vitest";
import {
	addCompletedStageId,
	advanceStage,
	FINISH_REWARD_SLOTS,
	getCompanionCount,
	getCompletedStageIds,
	getFinishClaimedCount,
	getInZone,
	getProfile,
	getStage,
	incrementFinishClaimed,
	isCheckInDone,
	isStageCompleted,
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
import { GAME_CONFIG, STORAGE_KEYS } from "@/constants";

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
			sessionStorage.setItem(STORAGE_KEYS.finishClaimed, "not-a-number");
			expect(getFinishClaimedCount()).toBe(0);
			sessionStorage.setItem(STORAGE_KEYS.finishClaimed, "99");
			expect(getFinishClaimedCount()).toBe(FINISH_REWARD_SLOTS);
		});
	});

	describe("stage", () => {
		it("defaults stage to 1", () => {
			expect(getStage()).toBe(1);
		});

		it("getStage falls back to 1 for out-of-range or non-numeric storage", () => {
			sessionStorage.setItem(STORAGE_KEYS.stage, "0");
			expect(getStage()).toBe(1);
			sessionStorage.setItem(STORAGE_KEYS.stage, "7");
			expect(getStage()).toBe(1);
			sessionStorage.setItem(STORAGE_KEYS.stage, "x");
			expect(getStage()).toBe(1);
		});

		it("setStage clamps to stage range", () => {
			setStage(0);
			expect(getStage()).toBe(GAME_CONFIG.MIN_STAGE);
			setStage(10);
			expect(getStage()).toBe(GAME_CONFIG.TOTAL_STAGES);
			setStage(3);
			expect(getStage()).toBe(3);
		});

		it("advanceStage moves forward until max stage", () => {
			setStage(1);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(2);
			expect(getInZone()).toBe(false);
			setStage(GAME_CONFIG.TOTAL_STAGES);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(GAME_CONFIG.TOTAL_STAGES);
		});

		it("advanceStage at last station keeps stage and in-zone", () => {
			setStage(GAME_CONFIG.TOTAL_STAGES);
			setInZone(true);
			advanceStage();
			expect(getStage()).toBe(GAME_CONFIG.TOTAL_STAGES);
			expect(getInZone()).toBe(true);
		});

		it("resetScavengerRun sets stage 1 and clears in-zone", () => {
			setStage(5);
			setInZone(true);
			addCompletedStageId(2);
			addCompletedStageId(4);
			resetScavengerRun();
			expect(getStage()).toBe(1);
			expect(getInZone()).toBe(false);
			expect(getCompletedStageIds()).toEqual([]);
		});
	});

	describe("completedStageIds (any order)", () => {
		it("addCompletedStageId merges unique sorted ids", () => {
			addCompletedStageId(3);
			addCompletedStageId(1);
			addCompletedStageId(3);
			expect(getCompletedStageIds()).toEqual([1, 3]);
			expect(isStageCompleted(1)).toBe(true);
			expect(isStageCompleted(2)).toBe(false);
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

		it("stageIds lists all stations by configured range", () => {
			expect(stageIds()).toEqual(
				Array.from(
					{ length: GAME_CONFIG.TOTAL_STAGES },
					(_, i) => i + GAME_CONFIG.MIN_STAGE,
				),
			);
		});
	});

	describe("inZone default and storage", () => {
		it("treats missing key as out-of-zone; explicit 1 as in", () => {
			expect(getInZone()).toBe(false);
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
			sessionStorage.setItem(STORAGE_KEYS.companionCount, "NaN");
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
