import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitCheckin } from "@/api/submitCheckin";
import * as apiBase from "@/lib/apiBase";

vi.mock("@/lib/apiBase");

describe("submitCheckin", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue(
			"https://api.example.com",
		);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("does not call fetch when VITE_API_BASE is not configured", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		const fetchMock = vi.fn();
		globalThis.fetch = fetchMock as typeof fetch;

		await submitCheckin({
			name: "A",
			employeeId: "E1",
			partySize: 2,
		});

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("posts JSON body with credentials", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
		});
		globalThis.fetch = fetchMock as typeof fetch;

		await submitCheckin({
			name: "Brian",
			employeeId: "E2E1001",
			partySize: 3,
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/api/v1/checkin",
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					name: "Brian",
					employeeId: "E2E1001",
					partySize: 3,
				}),
			}),
		);
	});

	it("throws with checkin status prefix when response is not ok", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			text: () => Promise.resolve('{"code":"CHECKIN_IDENTITY_MISMATCH"}'),
		}) as typeof fetch;

		await expect(
			submitCheckin({ name: "X", employeeId: "Y", partySize: 1 }),
		).rejects.toThrow(/checkin 401:/);
	});
});
