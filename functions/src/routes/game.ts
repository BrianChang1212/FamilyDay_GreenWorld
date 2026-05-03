import { Router } from "express";
import { badRequest, normalizeText } from "../utils/http";
import { getSessionUser } from "../utils/authGuard";
import {
	applyAttemptResult,
	claimFinishRewardProgress,
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

	// 題幹與選項顯示由前端題庫負責；後端只確認題目存在並驗證作答與進度
	res.status(200).json({
		challengeId: challenge.id,
	});
});

gameRouter.post("/challenges/:challengeId/attempts", async (req, res) => {
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

	const result = await applyAttemptResult(
		session.employeeId,
		challengeId,
		choiceId,
	);
	res.status(200).json({
		correct: result.correct,
		nextStageId: result.nextStageId,
		completedStageIds: result.completedStageIds,
		allStagesCompleted: result.allStagesCompleted,
	});
});

gameRouter.post("/me/playthrough/restart", async (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const restarted = await restartPlaythrough(session.employeeId);
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

gameRouter.post("/me/reward/claim", async (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}

	const out = await claimFinishRewardProgress(session.employeeId);
	if (!out.ok) {
		res.status(409).json(badRequest(out.code, out.message));
		return;
	}
	res.status(200).json({
		ok: true,
		rewardRedeemCount: out.rewardRedeemCount,
	});
});

gameRouter.get("/me/progress", async (req, res) => {
	const session = getSessionUser(req);
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}
	res.status(200).json(await getOrInitProgress(session.employeeId));
});
