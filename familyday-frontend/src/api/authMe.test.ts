import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthMe } from "@/api/authMe";
import * as apiBase from "@/lib/apiBase";

vi.mock("@/lib/apiBase");
vi.mock("@/lib/sessionToken", () => ({ authHeaders: () => ({}) }));

describe("fetchAuthMe", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue(
			"https://api.example.com",
		);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("returns the user and sends cookie credentials on 200", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					employeeId: "8411007",
					name: "吳春發",
					displayName: "吳春發",
				}),
		});
		globalThis.fetch = fetchMock as typeof fetch;

		const me = await fetchAuthMe();

		expect(me).toEqual({ employeeId: "8411007", name: "吳春發" });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/auth/me",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("returns null when not authenticated (non-ok)", async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue({ ok: false, status: 401 }) as typeof fetch;

		expect(await fetchAuthMe()).toBeNull();
	});

	it("returns null on network error", async () => {
		globalThis.fetch = vi
			.fn()
			.mockRejectedValue(new Error("Failed to fetch")) as typeof fetch;

		expect(await fetchAuthMe()).toBeNull();
	});

	it("returns null when body has no employeeId", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		}) as typeof fetch;

		expect(await fetchAuthMe()).toBeNull();
	});
});
