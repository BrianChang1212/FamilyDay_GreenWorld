import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { badRequest, getCookie, normalizeText, toPositiveInt } from "../../src/utils/http";

function requestWithCookie(cookie?: string): Request {
	return {
		headers: {
			cookie,
		},
	} as Request;
}

describe("http helpers", () => {
	it("builds a standard API error body", () => {
		expect(badRequest("INVALID_INPUT", "Missing employeeId")).toEqual({
			code: "INVALID_INPUT",
			message: "Missing employeeId",
		});
	});

	it("normalizes unknown text values into trimmed strings", () => {
		expect(normalizeText("  A123  ")).toBe("A123");
		expect(normalizeText(null)).toBe("");
		expect(normalizeText(undefined)).toBe("");
		expect(normalizeText(123)).toBe("123");
	});

	it("parses positive integers and floors decimal input", () => {
		expect(toPositiveInt("3")).toBe(3);
		expect(toPositiveInt(2.9)).toBe(2);
	});

	it("returns the fallback for invalid or non-positive integers", () => {
		expect(toPositiveInt("abc", 7)).toBe(7);
		expect(toPositiveInt(0, 7)).toBe(7);
		expect(toPositiveInt(-1, 7)).toBe(7);
	});

	it("extracts and decodes a named cookie", () => {
		const req = requestWithCookie("theme=dark; fdgw_session=a%20b%2Fc; other=value");

		expect(getCookie(req, "fdgw_session")).toBe("a b/c");
	});

	it("returns an empty string when the cookie header or key is missing", () => {
		expect(getCookie(requestWithCookie(), "fdgw_session")).toBe("");
		expect(getCookie(requestWithCookie("theme=dark"), "fdgw_session")).toBe("");
	});
});
