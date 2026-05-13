import type { Request } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSessionUser } from "../../src/utils/authGuard";
import { createSessionToken, getSessionCookieName, type SessionPayload } from "../../src/utils/session";

const originalEnv = { ...process.env };

function restoreEnv(): void {
	process.env = { ...originalEnv };
}

function requestWithHeaders(headers: Request["headers"]): Request {
	return { headers } as Request;
}

describe("auth guard", () => {
	const payload: SessionPayload = {
		employeeId: "E001",
		name: "Brian",
		iat: 1710000000000,
	};

	beforeEach(() => {
		restoreEnv();
		process.env.FDGW_SESSION_SECRET = "unit-test-secret";
	});

	afterEach(() => {
		restoreEnv();
	});

	it("returns the session user from a valid Bearer token", () => {
		const token = createSessionToken(payload);
		const req = requestWithHeaders({
			authorization: `Bearer ${token}`,
		});

		expect(getSessionUser(req)).toEqual(payload);
	});

	it("prefers a valid Bearer token over a cookie session", () => {
		const bearerPayload = { ...payload, employeeId: "E001" };
		const cookiePayload = { ...payload, employeeId: "E002" };
		const req = requestWithHeaders({
			authorization: `Bearer ${createSessionToken(bearerPayload)}`,
			cookie: `${getSessionCookieName()}=${encodeURIComponent(createSessionToken(cookiePayload))}`,
		});

		expect(getSessionUser(req)).toEqual(bearerPayload);
	});

	it("falls back to a valid session cookie when Bearer auth is absent", () => {
		const token = createSessionToken(payload);
		const req = requestWithHeaders({
			cookie: `${getSessionCookieName()}=${encodeURIComponent(token)}`,
		});

		expect(getSessionUser(req)).toEqual(payload);
	});

	it("falls back to a valid session cookie when Bearer auth is invalid", () => {
		const token = createSessionToken(payload);
		const req = requestWithHeaders({
			authorization: "Bearer invalid-token",
			cookie: `${getSessionCookieName()}=${encodeURIComponent(token)}`,
		});

		expect(getSessionUser(req)).toEqual(payload);
	});

	it("returns null when neither Bearer nor cookie auth is valid", () => {
		const req = requestWithHeaders({
			authorization: "Bearer invalid-token",
			cookie: `${getSessionCookieName()}=invalid-token`,
		});

		expect(getSessionUser(req)).toBeNull();
	});
});
