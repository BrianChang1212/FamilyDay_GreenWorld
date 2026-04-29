import { Router } from "express";
import { badRequest, normalizeText } from "../utils/http";
import { getSessionUser } from "../utils/authGuard";
import {
	applyAttemptResult,
	getChallenge,
	getOrInitProgress,
	restartPlaythrough,
	stageIdToChallengeId,
} from "../state/game";

export const gameRouter = Router();

gameRouter.post("/stations/verify", (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const stageId = Number(req.body?.stageId);
	if (!Number.isFinite(stageId) || stageId < 1 || stageId > 6) {
		res
			.status(400)
			.json(badRequest("INVALID_STAGE_ID", "stageId must be between 1 and 6"));
		return;
	}

	const qrJwt = normalizeText(req.body?.qrJwt);
	if (!qrJwt) {
		res.status(400).json(badRequest("MISSING_QR_JWT", "qrJwt is required"));
		return;
	}

	res.status(200).json({
		ok: true,
		challengeId: stageIdToChallengeId(stageId),
		expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
		playerId: session.employeeId,
	});
});

gameRouter.get("/challenges/:challengeId", (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const challengeId = normalizeText(req.params.challengeId);
	const challenge = getChallenge(challengeId);
	if (!challenge) {
		res.status(404).json(badRequest("CHALLENGE_NOT_FOUND", "challenge not found"));
		return;
	}

	res.status(200).json({
		challengeId: challenge.id,
		title: challenge.title,
		options: challenge.options,
	});
});

gameRouter.post("/challenges/:challengeId/attempts", (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const challengeId = normalizeText(req.params.challengeId);
	if (!getChallenge(challengeId)) {
		res.status(404).json(badRequest("CHALLENGE_NOT_FOUND", "challenge not found"));
		return;
	}

	const choiceId = normalizeText(req.body?.choiceId || req.body?.answer);
	if (!choiceId) {
		res
			.status(400)
			.json(badRequest("INVALID_ATTEMPT_PAYLOAD", "choiceId is required"));
		return;
	}

	const result = applyAttemptResult(session.employeeId, challengeId, choiceId);
	res.status(200).json({
		correct: result.correct,
		nextStageId: result.nextStageId,
	});
});

gameRouter.post("/me/playthrough/restart", (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const restarted = restartPlaythrough(session.employeeId);
	if (!restarted) {
		res.status(409).json(
			badRequest(
				"RESTART_NOT_ALLOWED",
				"restart requires a full clear and remaining rounds",
			),
		);
		return;
	}
	res.status(200).json(restarted);
});

gameRouter.get("/me/progress", (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}
	res.status(200).json(getOrInitProgress(session.employeeId));
});
