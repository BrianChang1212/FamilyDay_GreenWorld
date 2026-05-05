/**
 * Shared defaults for Firebase project / emulator URLs.
 * Canonical file: repo root fdgw.project.json (keep .firebaserc "default" in sync).
 *
 * Env overrides (first match wins for project id):
 *   FDGW_FIREBASE_PROJECT_ID, VERIFY_FIREBASE_PROJECT, SMOKE_FIREBASE_PROJECT,
 *   GOOGLE_CLOUD_PROJECT
 * Event id: FDGW_EVENT_ID
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getRepoRoot() {
	return path.resolve(__dirname, "..", "..");
}

let cached = null;

export function loadFdgwProject() {
	if (cached) {
		return cached;
	}
	const p = path.join(getRepoRoot(), "fdgw.project.json");
	const raw = fs.readFileSync(p, "utf8");
	cached = JSON.parse(raw);
	return cached;
}

export function getFirebaseProjectId() {
	const fromEnv =
		process.env.FDGW_FIREBASE_PROJECT_ID ||
		process.env.VERIFY_FIREBASE_PROJECT ||
		process.env.SMOKE_FIREBASE_PROJECT ||
		process.env.GOOGLE_CLOUD_PROJECT;
	if (fromEnv && String(fromEnv).trim()) {
		return String(fromEnv).trim();
	}
	return loadFdgwProject().firebaseProjectId;
}

export function getFunctionsRegion() {
	return loadFdgwProject().functionsRegion || "us-central1";
}

export function getHttpsFunctionName() {
	return loadFdgwProject().httpsFunctionName || "api";
}

export function getEventId() {
	if (process.env.FDGW_EVENT_ID && String(process.env.FDGW_EVENT_ID).trim()) {
		return String(process.env.FDGW_EVENT_ID).trim();
	}
	const c = loadFdgwProject();
	return c.eventId || "familyday-2026";
}

/** Full base for HTTP calls to /api/v1 on the Functions emulator (Express mounted at /api/v1). */
export function getEmulatorApiV1Base() {
	const c = loadFdgwProject();
	const host = c.functionsEmulatorHost || "127.0.0.1";
	const port = Number(c.functionsEmulatorPort ?? 5003);
	const pid = getFirebaseProjectId();
	const region = getFunctionsRegion();
	const name = getHttpsFunctionName();
	return `http://${host}:${port}/${pid}/${region}/${name}/api/v1`;
}
