import crypto from "node:crypto";

export type SessionPayload = {
	employeeId: string;
	name: string;
	iat: number;
};

const COOKIE_NAME = "fdgw_session";

function base64url(input: string): string {
	return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64url(input: string): string {
	return Buffer.from(input, "base64url").toString("utf8");
}

function getSecret(): string {
	return process.env.FDGW_SESSION_SECRET || "fdgw-dev-only-secret";
}

function signature(data: string): string {
	return crypto
		.createHmac("sha256", getSecret())
		.update(data)
		.digest("base64url");
}

export function createSessionToken(payload: SessionPayload): string {
	const data = base64url(JSON.stringify(payload));
	return `${data}.${signature(data)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
	const [data, sig] = token.split(".");
	if (!data || !sig) {
		return null;
	}
	if (signature(data) !== sig) {
		return null;
	}
	try {
		const parsed = JSON.parse(fromBase64url(data)) as SessionPayload;
		if (!parsed.employeeId || !parsed.name || !parsed.iat) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function sessionCookieAttrs(): string {
	/*
	 * Hosting (*.web.app / *.firebaseapp.com) and API (*.run.app) are
	 * cross-site. SameSite=Lax cookies are not sent on cross-site fetch
	 * (credentials: "include") → /challenges/* returns 401 on phones.
	 *
	 * Firebase sets FUNCTIONS_EMULATOR=true only in emulators; production
	 * must use SameSite=None; Secure. (K_SERVICE is not relied on — avoids
	 * edge cases where runtime env differs.)
	 */
	const explicit = (process.env.FDGW_SESSION_COOKIE_SAMESITE || "").toLowerCase();
	if (explicit === "lax" || explicit === "strict" || explicit === "none") {
		if (explicit === "none") {
			return "Path=/; HttpOnly; SameSite=None; Secure";
		}
		if (explicit === "strict") {
			return "Path=/; HttpOnly; SameSite=Strict; Secure";
		}
		return "Path=/; HttpOnly; SameSite=Lax";
	}
	if (process.env.FUNCTIONS_EMULATOR === "true") {
		return "Path=/; HttpOnly; SameSite=Lax";
	}
	return "Path=/; HttpOnly; SameSite=None; Secure";
}

export function buildSessionCookie(token: string): string {
	return `${COOKIE_NAME}=${encodeURIComponent(token)}; ${sessionCookieAttrs()}`;
}

export function buildClearSessionCookie(): string {
	return `${COOKIE_NAME}=; Max-Age=0; ${sessionCookieAttrs()}`;
}

export function getSessionCookieName(): string {
	return COOKIE_NAME;
}
