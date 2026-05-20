import { describe, expect, it } from "vitest";
import { CLAIM_TOKEN_VALUE, isClaimToken } from "@/lib/claimPayload";

describe("isClaimToken", () => {
	it("接受正確 token", () => {
		expect(isClaimToken(CLAIM_TOKEN_VALUE)).toBe(true);
	});

	it("trim 前後空白", () => {
		expect(isClaimToken("  fdgw-claim-token  ")).toBe(true);
		expect(isClaimToken("\nfdgw-claim-token\t")).toBe(true);
	});

	it("拒絕站台 mock token", () => {
		expect(isClaimToken("stage-1-token")).toBe(false);
		expect(isClaimToken("stage-6-token")).toBe(false);
	});

	it("拒絕空字串", () => {
		expect(isClaimToken("")).toBe(false);
		expect(isClaimToken("   ")).toBe(false);
	});

	it("區分大小寫", () => {
		expect(isClaimToken("FDGW-CLAIM-TOKEN")).toBe(false);
		expect(isClaimToken("Fdgw-Claim-Token")).toBe(false);
	});

	it("拒絕內含 token 的較長字串", () => {
		expect(isClaimToken("prefix-fdgw-claim-token")).toBe(false);
		expect(isClaimToken("fdgw-claim-token-extra")).toBe(false);
	});
});
