import { getViteApiBase } from "@/lib/apiBase";

type ChallengeJson = {
	challengeId?: string;
	title?: string;
	options?: string[];
};

type AttemptJson = {
	correct?: boolean;
	nextChallengeId?: string;
};

type VerifyJson = {
	challengeId?: string;
};

type RestartJson = {
	ok?: boolean;
};

function getBaseOrThrow(): string {
	const base = getViteApiBase();
	if (!base) {
		throw new Error("VITE_API_BASE is not configured");
	}
	return base;
}

export async function verifyStation(token: string): Promise<string> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/stations/verify`, {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ token }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`stations/verify ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as VerifyJson;
	if (!data.challengeId) {
		throw new Error("stations/verify missing challengeId");
	}
	return data.challengeId;
}

export async function fetchChallenge(
	challengeId: string,
): Promise<{ challengeId: string; title: string; options: string[] }> {
	const base = getBaseOrThrow();
	const res = await fetch(
		`${base}/api/v1/challenges/${encodeURIComponent(challengeId)}`,
		{
			credentials: "include",
			headers: { Accept: "application/json" },
		},
	);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`challenges/${challengeId} ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as ChallengeJson;
	return {
		challengeId: data.challengeId || challengeId,
		title: data.title || challengeId,
		options: Array.isArray(data.options) ? data.options : [],
	};
}

export async function submitChallengeAttempt(
	challengeId: string,
	answer: string,
): Promise<{ correct: boolean; nextChallengeId: string | null }> {
	const base = getBaseOrThrow();
	const res = await fetch(
		`${base}/api/v1/challenges/${encodeURIComponent(challengeId)}/attempts`,
		{
			method: "POST",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ answer }),
		},
	);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`attempts ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as AttemptJson;
	return {
		correct: data.correct === true,
		nextChallengeId:
			typeof data.nextChallengeId === "string"
				? data.nextChallengeId
				: null,
	};
}

export async function restartPlaythrough(): Promise<void> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/me/playthrough/restart`, {
		method: "POST",
		credentials: "include",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`playthrough/restart ${res.status}: ${text.slice(0, 200)}`);
	}
	const data = (await res.json()) as RestartJson;
	if (!data.ok) {
		throw new Error("playthrough/restart failed");
	}
}

export async function logoutGame(): Promise<void> {
	const base = getBaseOrThrow();
	const res = await fetch(`${base}/api/v1/auth/logout`, {
		method: "POST",
		credentials: "include",
		headers: { Accept: "application/json" },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`auth/logout ${res.status}: ${text.slice(0, 200)}`);
	}
}
