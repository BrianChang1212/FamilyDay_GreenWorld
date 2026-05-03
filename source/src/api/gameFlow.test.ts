import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	claimFinishReward,
	fetchChallenge,
	logoutGame,
	restartPlaythrough,
	submitChallengeAttempt,
	verifyStation,
} from "@/api/gameFlow";
import * as apiBase from "@/lib/apiBase";

vi.mock("@/lib/apiBase");

describe("gameFlow api", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue(
			"https://api.example.com",
		);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("throws when VITE_API_BASE is not configured", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		await expect(verifyStation(1, "token-1")).rejects.toThrow(
			"VITE_API_BASE is not configured",
		);
	});

	it("verifyStation posts stageId and qrJwt then returns challenge id", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ challengeId: "stage-2" }),
		});
		globalThis.fetch = fetchMock as typeof fetch;

		const id = await verifyStation(2, "site-jwt");
		expect(id).toBe("stage-2");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/stations/verify",
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				body: JSON.stringify({ stageId: 2, qrJwt: "site-jwt" }),
			}),
		);
	});

	it("fetchChallenge maps fallback fields when payload is partial", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		}) as typeof fetch;

		const r = await fetchChallenge("天鵝湖");
		expect(r.challengeId).toBe("天鵝湖");
		expect(r.title).toBe("天鵝湖");
		expect(r.options).toEqual([]);
	});

	it("submitChallengeAttempt normalizes nextChallengeId", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ correct: true, nextStageId: 3 }),
		}) as typeof fetch;

		const r = await submitChallengeAttempt("stage-1", "A");
		expect(r).toEqual({ correct: true, nextChallengeId: "c3" });
	});

	it("restartPlaythrough resolves when API returns ok=true", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					ok: true,
					fullClearCount: 1,
					remainingRounds: 2,
				}),
		}) as typeof fetch;

		await expect(restartPlaythrough()).resolves.toBeUndefined();
	});

	it("claimFinishReward returns rewardRedeemCount when API ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					ok: true,
					rewardRedeemCount: 2,
				}),
		}) as typeof fetch;

		await expect(claimFinishReward()).resolves.toEqual({
			rewardRedeemCount: 2,
		});
		expect(globalThis.fetch).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/me/reward/claim",
			expect.objectContaining({
				method: "POST",
				credentials: "include",
			}),
		);
	});

	it("restartPlaythrough throws when API returns ok=false payload", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: false }),
		}) as typeof fetch;

		await expect(restartPlaythrough()).rejects.toThrow(
			"playthrough/restart failed",
		);
	});

	it("logoutGame throws status snippet when response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			text: () => Promise.resolve("unauthorized"),
		}) as typeof fetch;

		await expect(logoutGame()).rejects.toThrow(/auth\/logout 401:/);
	});
});
