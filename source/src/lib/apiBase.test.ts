import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const fdgw = JSON.parse(readFileSync(path.join(repoRoot, "fdgw.project.json"), "utf8")) as {
	firebaseProjectId: string;
	functionsRegion: string;
	functionsEmulatorHost?: string;
	functionsEmulatorPort?: number;
};
const emuHost = fdgw.functionsEmulatorHost || "127.0.0.1";
const emuPort = fdgw.functionsEmulatorPort ?? 5003;
const emulatorApiRoot = `http://${emuHost}:${emuPort}/${fdgw.firebaseProjectId}/${fdgw.functionsRegion}/api`;

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

	it("in DEV, rewrites 127.0.0.1 API to same-origin proxy when page is localhost", async () => {
		vi.stubEnv("VITE_API_BASE", emulatorApiRoot);
		const prev = window.location.hostname;
		window.location.hostname = "localhost";
		const { getViteApiBase } = await import("@/lib/apiBase");
		expect(getViteApiBase()).toBe("/fdgw-emulator-api");
		window.location.hostname = prev;
	});

	it("in DEV, does not rewrite when page and API both use localhost", async () => {
		const localhostApiRoot = emulatorApiRoot.replace("127.0.0.1", "localhost");
		vi.stubEnv("VITE_API_BASE", localhostApiRoot);
		const prev = window.location.hostname;
		window.location.hostname = "localhost";
		const { getViteApiBase } = await import("@/lib/apiBase");
		expect(getViteApiBase()).toBe(localhostApiRoot);
		window.location.hostname = prev;
	});
});
