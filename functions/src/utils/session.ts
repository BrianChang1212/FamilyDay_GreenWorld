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

export function buildSessionCookie(token: string): string {
	return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`;
}

export function buildClearSessionCookie(): string {
	return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionCookieName(): string {
	return COOKIE_NAME;
}
