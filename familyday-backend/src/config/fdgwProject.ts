import fs from "node:fs";
import path from "node:path";

export type FdgwDashboardStage = { id: number; title: string };

export type FdgwProjectFile = {
	_comment?: string;
	firebaseProjectId: string;
	functionsRegion: string;
	httpsFunctionName: string;
	functionsEmulatorHost: string;
	functionsEmulatorPort: number;
	hostingEmulatorPort?: number;
	eventId: string;
	branding: {
		year: string;
		companyName: string;
		eventTitle: string;
		location: string;
		copyright: string;
		defaultPlayerName: string;
		maxCompanions: number;
	};
	game: {
		minStage: number;
		totalStages: number;
		maxRewardRounds: number;
		stationVerifyTtlMinutes: number;
	};
	frontend: {
		viteDevPort: number;
		vitePreviewPort: number;
	};
	seed: {
		defaultEmployeeIdStart: string;
		defaultCount: number;
		defaultPartySizePlanned: number;
		maxCount: number;
	};
	verification: {
		defaultEmployeeId: string;
		defaultEmployeeName: string;
		defaultPartySize: number;
		testStageId: number;
		testQrJwt: string;
		staffId: string;
	};
	smokeTest: {
		employeeId: string;
		employeeName: string;
		defaultPartySize: number;
		staffId: string;
		testStageId: number;
		testQrJwt: string;
		testChallengeChoiceId: string;
	};
	corsOrigins: string[];
	dashboard: {
		eventSlug: string;
		eventDisplayName: string;
		stages: FdgwDashboardStage[];
	};
};

let cache: FdgwProjectFile | null = null;

/** Repo root (…/FamilyDay_GreenWorld_App), from compiled lib/config/*.js */
function repoRoot(): string {
	return path.resolve(__dirname, "..", "..", "..");
}

export function loadFdgwProject(): FdgwProjectFile {
	if (cache) {
		return cache;
	}
	const p = path.join(repoRoot(), "fdgw.project.json");
	cache = JSON.parse(fs.readFileSync(p, "utf8")) as FdgwProjectFile;
	return cache;
}

export function getEventId(): string {
	if (process.env.FDGW_EVENT_ID && String(process.env.FDGW_EVENT_ID).trim()) {
		return String(process.env.FDGW_EVENT_ID).trim();
	}
	return loadFdgwProject().eventId;
}

export function getTotalStages(): number {
	return loadFdgwProject().game.totalStages;
}

export function getMaxRewardRounds(): number {
	return loadFdgwProject().game.maxRewardRounds;
}

export function getStationVerifyTtlMs(): number {
	const m = loadFdgwProject().game.stationVerifyTtlMinutes;
	return Math.max(1, m) * 60 * 1000;
}

export function getCorsAllowlist(): Set<string> {
	return new Set(loadFdgwProject().corsOrigins);
}

/** JSON list plus localhost / 127.0.0.1 for configured Vite ports. */
export function getCorsAllowlistResolved(): Set<string> {
	const s = getCorsAllowlist();
	const p = loadFdgwProject().frontend;
	s.add(`http://localhost:${p.viteDevPort}`);
	s.add(`http://127.0.0.1:${p.viteDevPort}`);
	s.add(`http://localhost:${p.vitePreviewPort}`);
	s.add(`http://127.0.0.1:${p.vitePreviewPort}`);
	return s;
}

export function getFunctionsRegion(): string {
	return loadFdgwProject().functionsRegion;
}
