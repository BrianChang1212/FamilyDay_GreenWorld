import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginGame } from "@/api/authLogin";
import * as apiBase from "@/lib/apiBase";

vi.mock("@/lib/apiBase");

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

	it("throws when VITE_API_BASE is not configured", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		await expect(loginGame("N", "E")).rejects.toThrow(
			"VITE_API_BASE is not configured",
		);
	});

	it("posts name and employeeId with credentials", async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
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
