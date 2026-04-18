import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getViteApiBase", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns value without trailing slash", async () => {
		vi.stubEnv("VITE_API_BASE", "https://api.example.com/");
		const { getViteApiBase } = await import("@/lib/apiBase");
		expect(getViteApiBase()).toBe("https://api.example.com");
	});

	it("returns empty string when unset", async () => {
		vi.stubEnv("VITE_API_BASE", "");
		const { getViteApiBase } = await import("@/lib/apiBase");
		expect(getViteApiBase()).toBe("");
	});

	it("treats multiple trailing slashes as removed stepwise via replace", async () => {
		vi.stubEnv("VITE_API_BASE", "https://x.com///");
		const { getViteApiBase } = await import("@/lib/apiBase");
		// replace only removes one trailing slash per the implementation
		expect(getViteApiBase()).toBe("https://x.com//");
	});
});
