import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCheckinStatus } from "@/api/checkinStatus";
import * as apiBase from "@/lib/apiBase";

vi.mock("@/lib/apiBase");

describe("fetchCheckinStatus", () => {
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
		await expect(fetchCheckinStatus()).rejects.toThrow(
			"VITE_API_BASE is not configured",
		);
	});

	it("requests encoded employeeId query when provided", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ checkedIn: true, checkinAt: "t1" }),
		});
		globalThis.fetch = fetchMock as typeof fetch;

		const r = await fetchCheckinStatus(" A 01 ");
		expect(r).toEqual({ checkedIn: true, checkinAt: "t1" });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/checkin/status?employeeId=A%2001",
			expect.objectContaining({
				credentials: "include",
				headers: { Accept: "application/json" },
			}),
		);
	});

	it("normalizes payload defaults", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ checkedIn: false }),
		}) as typeof fetch;

		const r = await fetchCheckinStatus();
		expect(r.checkedIn).toBe(false);
		expect(r.checkinAt).toBeNull();
	});

	it("throws status snippet when response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.resolve("db timeout"),
		}) as typeof fetch;

		await expect(fetchCheckinStatus()).rejects.toThrow(/checkin\/status 500:/);
	});
});
