import { Router } from "express";
import { verifyRosterIdentity } from "../state/roster";
import { badRequest, getCookie, normalizeText } from "../utils/http";
import {
	buildClearSessionCookie,
	buildSessionCookie,
	createSessionToken,
	getSessionCookieName,
	verifySessionToken,
} from "../utils/session";

export const authRouter = Router();

authRouter.post("/auth/login", async (req, res) => {
	try {
		const employeeId = normalizeText(req.body?.employeeId);
		const name = normalizeText(req.body?.name);
		if (!employeeId || !name) {
			res
				.status(400)
				.json(badRequest("INVALID_AUTH_PAYLOAD", "employeeId and name are required"));
			return;
		}

		const employee = await verifyRosterIdentity(employeeId, name);
		if (!employee) {
			res.status(401).json(
				badRequest(
					"AUTH_IDENTITY_MISMATCH",
					"name and employeeId do not match Firestore roster",
				),
			);
			return;
		}

		const token = createSessionToken({
			employeeId: employee.employeeId,
			name: employee.name,
			iat: Date.now(),
		});
		res.setHeader("Set-Cookie", buildSessionCookie(token));
		res.status(200).json({
			ok: true,
			user: {
				employeeId: employee.employeeId,
				name: employee.name,
			},
		});
	} catch {
		res.status(500).json(badRequest("AUTH_BACKEND_ERROR", "failed to validate roster"));
	}
});

authRouter.post("/auth/logout", (_req, res) => {
	res.setHeader("Set-Cookie", buildClearSessionCookie());
	res.status(200).json({ ok: true });
});

authRouter.get("/auth/me", (req, res) => {
	const raw = getCookie(req, getSessionCookieName());
	const session = raw ? verifySessionToken(raw) : null;
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}
	res.status(200).json({
		employeeId: session.employeeId,
		name: session.name,
		displayName: session.name,
	});
});
