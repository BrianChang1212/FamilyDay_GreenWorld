import type { Request } from "express";
import { getCookie } from "./http";
import { getSessionCookieName, verifySessionToken } from "./session";

export type SessionUser = {
	employeeId: string;
	name: string;
	iat: number;
};

export function getSessionUser(req: Request): SessionUser | null {
	const raw = getCookie(req, getSessionCookieName());
	const session = raw ? verifySessionToken(raw) : null;
	if (!session) {
		return null;
	}
	return session;
}
