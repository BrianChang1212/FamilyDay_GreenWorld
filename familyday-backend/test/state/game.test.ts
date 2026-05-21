import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	applyAttemptResult,
	claimFinishRewardProgress,
	defaultProgress,
	getChallenge,
	getOrInitProgress,
	restartPlaythrough,
	stageIdToChallengeId,
} from "../../src/state/game";

const originalEnv = { ...process.env };
let employeeSeq = 0;

function restoreEnv(): void {
	process.env = { ...originalEnv };
}

function nextEmployeeId(): string {
	employeeSeq += 1;
	return `UNIT-GAME-${employeeSeq}`;
}

async function completeAllStages(employeeId: string): Promise<void> {
	for (const [challengeId, choiceId] of [
		["c1", "B"],
		["c2", "B"],
		["c3", "B"],
		["c4", "B"],
		["c5", "B"],
		["c6", "C"],
	]) {
		await applyAttemptResult(employeeId, challengeId, choiceId);
	}
}

describe("game state", () => {
	beforeEach(() => {
		restoreEnv();
		delete process.env.FDGW_USE_FIRESTORE;
	});

	afterEach(() => {
		restoreEnv();
	});

	it("creates the default player progress shape", () => {
		expect(defaultProgress()).toEqual({
			currentStageId: 1,
			completedStageIds: [],
			fullClearCount: 0,
			bankedFullClears: 0,
			rewardRedeemCount: 0,
			rewardRedeemAt: [],
			maxRounds: 3,
		});
	});

	it("maps stages to backend challenge ids and falls back to the first challenge", () => {
		expect(stageIdToChallengeId(1)).toBe("c1");
		expect(stageIdToChallengeId(6)).toBe("c6");
		expect(stageIdToChallengeId(0)).toBe("c1");
		expect(stageIdToChallengeId(99)).toBe("c1");
		expect(getChallenge("c6")).toEqual({ id: "c6", correctChoiceId: "C" });
		expect(getChallenge("unknown")).toBeNull();
	});

	it("does not advance progress for an incorrect answer", async () => {
		const employeeId = nextEmployeeId();

		const result = await applyAttemptResult(employeeId, "c1", "A");
		const progress = await getOrInitProgress(employeeId);

		expect(result).toEqual({
			correct: false,
			nextStageId: 1,
			completedStageIds: [],
			allStagesCompleted: false,
		});
		expect(progress.completedStageIds).toEqual([]);
		expect(progress.bankedFullClears).toBe(0);
	});

	it("records completed stages once and banks a full clear after all stages pass", async () => {
		const employeeId = nextEmployeeId();

		await applyAttemptResult(employeeId, "c1", "B");
		await applyAttemptResult(employeeId, "c1", "B");
		await completeAllStages(employeeId);
		const progress = await getOrInitProgress(employeeId);

		expect(progress.completedStageIds).toEqual([1, 2, 3, 4, 5, 6]);
		expect(progress.currentStageId).toBe(6);
		expect(progress.bankedFullClears).toBe(1);
	});

	it("全破後重玩任一關不會清掉 completedStageIds（保留闖關紀錄）", async () => {
		const employeeId = nextEmployeeId();
		await completeAllStages(employeeId);

		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: true,
			rewardRedeemCount: 1,
		});

		const beforeReplay = await getOrInitProgress(employeeId);
		expect(beforeReplay.completedStageIds).toEqual([1, 2, 3, 4, 5, 6]);

		await applyAttemptResult(employeeId, "c1", "B");
		await applyAttemptResult(employeeId, "c4", "B");
		await applyAttemptResult(employeeId, "c6", "C");

		const afterReplay = await getOrInitProgress(employeeId);
		expect(afterReplay.completedStageIds).toEqual([1, 2, 3, 4, 5, 6]);
		expect(afterReplay.bankedFullClears).toBe(1);
		expect(afterReplay.fullClearCount).toBe(0);
	});

	it("rejects reward claims before a full clear", async () => {
		const employeeId = nextEmployeeId();

		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: false,
			code: "FINISH_CLAIM_NOT_READY",
			message: "all stages must be completed before claiming",
		});
	});

	it("allows continuous reward claims after one full clear until the reward limit", async () => {
		const employeeId = nextEmployeeId();
		await completeAllStages(employeeId);

		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: true,
			rewardRedeemCount: 1,
		});
		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: true,
			rewardRedeemCount: 2,
		});
		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: true,
			rewardRedeemCount: 3,
		});
		expect(await claimFinishRewardProgress(employeeId)).toEqual({
			ok: false,
			code: "REWARD_CLAIM_LIMIT_REACHED",
			message: "reward claim limit reached",
		});
	});

	it("每次領獎都會記錄 ISO 時間戳記到 rewardRedeemAt 陣列", async () => {
		const employeeId = nextEmployeeId();
		await completeAllStages(employeeId);

		const t0 = Date.now();
		await claimFinishRewardProgress(employeeId);
		await claimFinishRewardProgress(employeeId);
		await claimFinishRewardProgress(employeeId);
		const t1 = Date.now();

		const progress = await getOrInitProgress(employeeId);
		expect(progress.rewardRedeemCount).toBe(3);
		expect(progress.rewardRedeemAt).toHaveLength(3);
		for (const iso of progress.rewardRedeemAt) {
			const ts = Date.parse(iso);
			expect(Number.isFinite(ts)).toBe(true);
			expect(ts).toBeGreaterThanOrEqual(t0);
			expect(ts).toBeLessThanOrEqual(t1);
		}
	});

	it("restarts a completed playthrough and increments the full clear counter", async () => {
		const employeeId = nextEmployeeId();
		await completeAllStages(employeeId);

		expect(await restartPlaythrough(employeeId)).toEqual({
			ok: true,
			fullClearCount: 1,
			remainingRounds: null,
		});
		expect(await getOrInitProgress(employeeId)).toMatchObject({
			currentStageId: 1,
			completedStageIds: [],
			fullClearCount: 1,
			bankedFullClears: 1,
		});
	});
});
