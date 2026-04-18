import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	parseMockClaimedQueryParam,
	resolveRewardClaimPresentation,
} from "@/lib/rewardClaimPresentation";
import * as apiBase from "@/lib/apiBase";
import * as rewardApi from "@/api/rewardClaimStatus";

vi.mock("@/lib/apiBase");
vi.mock("@/api/rewardClaimStatus");

describe("parseMockClaimedQueryParam", () => {
	const max = 3;

	it("returns null for undefined, null, empty, or whitespace-only", () => {
		expect(parseMockClaimedQueryParam(undefined, max)).toBeNull();
		expect(parseMockClaimedQueryParam(null, max)).toBeNull();
		expect(parseMockClaimedQueryParam("", max)).toBeNull();
		expect(parseMockClaimedQueryParam("   ", max)).toBeNull();
	});

	it("uses first element when query value is an array", () => {
		expect(parseMockClaimedQueryParam(["2", "9"], max)).toBe(2);
	});

	it("clamps to [0, maxSlots]", () => {
		expect(parseMockClaimedQueryParam("-1", max)).toBe(0);
		expect(parseMockClaimedQueryParam("99", max)).toBe(3);
		expect(parseMockClaimedQueryParam("2", max)).toBe(2);
		expect(parseMockClaimedQueryParam("0", max)).toBe(0);
	});

	it("returns null when parseInt is not finite", () => {
		expect(parseMockClaimedQueryParam("abc", max)).toBeNull();
	});

	it("parses integer prefix of numeric strings (parseInt semantics)", () => {
		expect(parseMockClaimedQueryParam("1.9", max)).toBe(1);
	});

	it("returns null for empty query array (no first element)", () => {
		expect(parseMockClaimedQueryParam([], max)).toBeNull();
	});

	it("accepts numeric query values coerced via String", () => {
		expect(parseMockClaimedQueryParam(2 as unknown, max)).toBe(2);
	});
});

describe("resolveRewardClaimPresentation", () => {
	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockReset();
	});

	it("returns mock-query when mockClaimed is set", async () => {
		const r = await resolveRewardClaimPresentation(2, () => 0);
		expect(r).toEqual({
			loadState: "ok",
			claimed: 2,
			maxSlots: 3,
			statusSource: "mock-query",
		});
		expect(rewardApi.fetchRewardClaimStatus).not.toHaveBeenCalled();
	});

	it("uses local-fallback when API base is empty", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		const r = await resolveRewardClaimPresentation(null, () => 2);
		expect(r).toEqual({
			loadState: "ok",
			claimed: 2,
			maxSlots: 3,
			statusSource: "local-fallback",
		});
	});

	it("calls fetchRewardClaimStatus when API base is set", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.test");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockResolvedValue({
			claimedCount: 1,
			maxSlots: 5,
		});
		const r = await resolveRewardClaimPresentation(null, () => 0);
		expect(r).toEqual({
			loadState: "ok",
			claimed: 1,
			maxSlots: 5,
			statusSource: "api",
		});
		expect(rewardApi.fetchRewardClaimStatus).toHaveBeenCalledOnce();
	});

	it("returns api error state when fetch throws Error", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.test");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockRejectedValue(
			new Error("network down"),
		);
		const r = await resolveRewardClaimPresentation(null, () => 0);
		expect(r).toEqual({
			loadState: "error",
			statusSource: "api",
			error: "network down",
		});
	});

	it("returns generic api error when fetch throws non-Error", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.test");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockRejectedValue("x");
		const r = await resolveRewardClaimPresentation(null, () => 0);
		expect(r).toEqual({
			loadState: "error",
			statusSource: "api",
			error: "無法載入領獎狀態",
		});
	});
});
