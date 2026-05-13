import type { Request } from "express";
import { getCookie } from "./http";
import { getSessionCookieName, verifySessionToken } from "./session";

export type SessionUser = {
	employeeId: string;
	name: string;
	iat: number;
};

export function getSessionUser(req: Request): SessionUser | null {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) {
		const session = verifySessionToken(authHeader.slice(7));
		if (session) return session;
	}
	const raw = getCookie(req, getSessionCookieName());
	return raw ? verifySessionToken(raw) : null;
}
