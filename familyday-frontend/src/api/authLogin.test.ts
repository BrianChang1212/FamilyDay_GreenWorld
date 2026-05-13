import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginGame } from "@/api/authLogin";
import * as apiBase from "@/lib/apiBase";
import * as sessionToken from "@/lib/sessionToken";

vi.mock("@/lib/apiBase");
vi.mock("@/lib/sessionToken");

describe("loginGame", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue(
			"https://api.example.com",
		);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("stores token from response body after successful login", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true, token: "test-token-abc" }),
		}) as typeof fetch;

		await loginGame("N", "E");

		expect(vi.mocked(sessionToken.setSessionToken)).toHaveBeenCalledWith("test-token-abc");
	});

	it("does not store token when response body has no token", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true }),
		}) as typeof fetch;

		await loginGame("N", "E");

		expect(vi.mocked(sessionToken.setSessionToken)).not.toHaveBeenCalled();
	});

	it("posts name and employeeId with credentials", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true }),
		});
		globalThis.fetch = fetchMock as typeof fetch;

		await loginGame("王小明", "E123");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/auth/login",
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					name: "王小明",
					employeeId: "E123",
				}),
			}),
		);
	});

	it("throws with auth/login status prefix when response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			text: () => Promise.resolve("AUTH_IDENTITY_MISMATCH"),
		}) as typeof fetch;

		await expect(loginGame("a", "b")).rejects.toThrow(/auth\/login 401:/);
	});
});
