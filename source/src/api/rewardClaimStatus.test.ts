import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRewardClaimStatus } from "@/api/rewardClaimStatus";
import * as apiBase from "@/lib/apiBase";
import { FINISH_REWARD_SLOTS } from "@/lib/constants/finishReward";

vi.mock("@/lib/apiBase");

describe("fetchRewardClaimStatus", () => {
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
		await expect(fetchRewardClaimStatus()).rejects.toThrow(
			"VITE_API_BASE is not configured",
		);
	});

	it("requests dashboard with credentials and Accept header", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 1, maxRounds: 3 },
				}),
		});
		globalThis.fetch = fetchMock as typeof fetch;

		await fetchRewardClaimStatus();

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/me/dashboard",
			expect.objectContaining({
				credentials: "include",
				headers: { Accept: "application/json" },
			}),
		);
	});

	it("prefers rewardRedeemCount over fullClearCount", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: {
						rewardRedeemCount: 2,
						fullClearCount: 9,
						maxRounds: 3,
					},
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(2);
		expect(r.maxSlots).toBe(3);
	});

	it("falls back to fullClearCount when rewardRedeemCount is absent", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { fullClearCount: 2, maxRounds: 3 },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(2);
	});

	it("uses FINISH_REWARD_SLOTS when maxRounds is invalid", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 1, maxRounds: 0 },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.maxSlots).toBe(FINISH_REWARD_SLOTS);
	});

	it("clamps claimed count into [0, maxSlots] and floors non-integers", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 2.7, maxRounds: 3 },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(2);
	});

	it("throws with status snippet when response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 503,
			text: () => Promise.resolve("upstream unavailable"),
		}) as typeof fetch;

		await expect(fetchRewardClaimStatus()).rejects.toThrow(
			/dashboard 503:/,
		);
	});

	it("uses FINISH_REWARD_SLOTS when maxRounds is above 99", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 1, maxRounds: 100 },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.maxSlots).toBe(FINISH_REWARD_SLOTS);
	});

	it("treats non-finite maxRounds as invalid", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 1, maxRounds: Number.NaN },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.maxSlots).toBe(FINISH_REWARD_SLOTS);
	});

	it("handles missing progress as zeros and default max", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(0);
		expect(r.maxSlots).toBe(FINISH_REWARD_SLOTS);
	});

	it("uses rewardRedeemCount 0 without falling through to fullClearCount", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: {
						rewardRedeemCount: 0,
						fullClearCount: 5,
						maxRounds: 3,
					},
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(0);
	});

	it("clamps claimed above maxSlots", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					progress: { rewardRedeemCount: 99, maxRounds: 3 },
				}),
		}) as typeof fetch;

		const r = await fetchRewardClaimStatus();
		expect(r.claimedCount).toBe(3);
		expect(r.maxSlots).toBe(3);
	});

	it("propagates when response json fails", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.reject(new Error("invalid json")),
		}) as typeof fetch;

		await expect(fetchRewardClaimStatus()).rejects.toThrow("invalid json");
	});

	it("uses empty body snippet when error response text fails", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.reject(new Error("read fail")),
		}) as typeof fetch;

		await expect(fetchRewardClaimStatus()).rejects.toThrow(/dashboard 500: $/);
	});
});
