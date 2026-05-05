import { Router } from "express";
import { issueRedeemToken, confirmRedeem } from "../state/redeem";
import { badRequest, normalizeText } from "../utils/http";
import { getSessionUser } from "../utils/authGuard";

export const staffRouter = Router();

staffRouter.post("/staff/redeem/token", async (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const issued = await issueRedeemToken(session.employeeId, 300);
	res.status(200).json(issued);
});

staffRouter.post("/staff/redeem/confirm", async (req, res) => {
	const staffId = normalizeText(req.body?.staffId);
	const token = normalizeText(req.body?.token);
	if (!staffId || !token) {
		res
			.status(400)
			.json(badRequest("INVALID_REDEEM_CONFIRM", "staffId and token are required"));
		return;
	}

	const confirmed = await confirmRedeem(token, staffId);
	if (!confirmed.ok) {
		res.status(409).json(badRequest(confirmed.code, confirmed.message));
		return;
	}
	res.status(200).json(confirmed);
});
