import { describe, expect, it } from "vitest";
import { parseApiErrorCode } from "@/lib/parseApiErrorJson";

describe("parseApiErrorCode", () => {
	it("returns null when JSON brace missing", () => {
		expect(parseApiErrorCode("upstream")).toBeNull();
	});

	it("parses code from typical gameFlow claim errors", () => {
		const msg =
			'me/reward/claim 409: {"code":"REWARD_CLAIM_NOT_ELIGIBLE","message":"no banked"}';
		expect(parseApiErrorCode(msg)).toBe("REWARD_CLAIM_NOT_ELIGIBLE");
	});

	it("returns null when JSON invalid", () => {
		expect(parseApiErrorCode("{not-json")).toBeNull();
	});

	it("returns null when code is not string", () => {
		expect(parseApiErrorCode('{"code":404}')).toBeNull();
	});
});
