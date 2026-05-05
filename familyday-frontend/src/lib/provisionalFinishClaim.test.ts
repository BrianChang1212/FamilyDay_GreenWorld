import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { incrementLocalFinishClaimIfNoApiBase } from "@/lib/provisionalFinishClaim";
import * as apiBase from "@/lib/apiBase";
import * as demoState from "@/lib/demoState";

vi.mock("@/lib/apiBase");

describe("incrementLocalFinishClaimIfNoApiBase", () => {
	let incSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReset();
		incSpy = vi
			.spyOn(demoState, "incrementFinishClaimed")
			.mockReturnValue(1);
	});

	afterEach(() => {
		incSpy.mockRestore();
	});

	it("increments local count when API base is not set", () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		incrementLocalFinishClaimIfNoApiBase();
		expect(demoState.incrementFinishClaimed).toHaveBeenCalledOnce();
	});

	it("does not increment when API base is set", () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.example.com");
		incrementLocalFinishClaimIfNoApiBase();
		expect(demoState.incrementFinishClaimed).not.toHaveBeenCalled();
	});
});
