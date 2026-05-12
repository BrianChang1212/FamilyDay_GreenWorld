/**
 * Production frontend build for Firebase Hosting.
 *
 * Vite loads .env.local after .env.production, so a typical developer
 * machine embeds localhost / emulator URLs into `npm run build` unless
 * VITE_API_BASE is set in the process environment (highest priority).
 *
 * Resolution order:
 *   1) process.env.VITE_API_BASE
 *   2) fdgw.project.json -> productionApi.viteApiBase
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const frontendRoot = path.join(repoRoot, "familyday-frontend");
const fdgwPath = path.join(backendRoot, "fdgw.project.json");

function loadViteApiBase() {
	if (process.env.VITE_API_BASE?.trim()) {
		return process.env.VITE_API_BASE.trim().replace(/\/$/, "");
	}
	const raw = fs.readFileSync(fdgwPath, "utf8");
	const fdgw = JSON.parse(raw);
	const fromFdgw = fdgw.productionApi?.viteApiBase;
	if (typeof fromFdgw === "string" && fromFdgw.trim()) {
		return fromFdgw.trim().replace(/\/$/, "");
	}
	console.error(
		"build-frontend-for-hosting: set VITE_API_BASE or productionApi.viteApiBase in fdgw.project.json",
	);
	process.exit(1);
}

const viteApiBase = loadViteApiBase();

const result = spawnSync("npm", ["run", "build"], {
	cwd: frontendRoot,
	env: { ...process.env, VITE_API_BASE: viteApiBase },
	stdio: "inherit",
	shell: true,
});

if (result.error) {
	console.error(result.error);
	process.exit(1);
}
if (result.status !== 0) {
	process.exit(result.status ?? 1);
}
console.log(`build-frontend-for-hosting: VITE_API_BASE=${viteApiBase}`);
