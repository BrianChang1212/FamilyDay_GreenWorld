import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	buildClearSessionCookie,
	buildSessionCookie,
	createSessionToken,
	getSessionCookieName,
	type SessionPayload,
	verifySessionToken,
} from "../../src/utils/session";

const originalEnv = { ...process.env };

function restoreEnv(): void {
	process.env = { ...originalEnv };
}

describe("session helpers", () => {
	const payload: SessionPayload = {
		employeeId: "E001",
		name: "Brian",
		iat: 1710000000000,
	};

	beforeEach(() => {
		restoreEnv();
		process.env.FDGW_SESSION_SECRET = "unit-test-secret";
		delete process.env.FDGW_SESSION_COOKIE_SAMESITE;
		delete process.env.FUNCTIONS_EMULATOR;
	});

	afterEach(() => {
		restoreEnv();
	});

	it("creates a token that verifies back to the original payload", () => {
		const token = createSessionToken(payload);

		expect(verifySessionToken(token)).toEqual(payload);
	});

	it("rejects tokens signed with a different secret", () => {
		const token = createSessionToken(payload);

		process.env.FDGW_SESSION_SECRET = "different-secret";

		expect(verifySessionToken(token)).toBeNull();
	});

	it("rejects malformed tokens and incomplete payloads", () => {
		const incompletePayload = Buffer.from(
			JSON.stringify({ employeeId: "E001", iat: payload.iat }),
			"utf8",
		).toString("base64url");

		expect(verifySessionToken("not-a-token")).toBeNull();
		expect(verifySessionToken(`${incompletePayload}.bad-signature`)).toBeNull();
	});

	it("builds a secure cross-site session cookie by default", () => {
		const token = createSessionToken(payload);

		expect(buildSessionCookie(token)).toBe(
			`${getSessionCookieName()}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure`,
		);
	});

	it("uses lax session cookies in the Functions emulator", () => {
		process.env.FUNCTIONS_EMULATOR = "true";

		expect(buildSessionCookie("abc")).toBe(
			`${getSessionCookieName()}=abc; Path=/; HttpOnly; SameSite=Lax`,
		);
	});

	it("honors explicit SameSite cookie overrides", () => {
		process.env.FDGW_SESSION_COOKIE_SAMESITE = "strict";

		expect(buildSessionCookie("abc")).toBe(
			`${getSessionCookieName()}=abc; Path=/; HttpOnly; SameSite=Strict; Secure`,
		);
	});

	it("builds a clear cookie with max age zero", () => {
		expect(buildClearSessionCookie()).toBe(
			`${getSessionCookieName()}=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure`,
		);
	});
});
