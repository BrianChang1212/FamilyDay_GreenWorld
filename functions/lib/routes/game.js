"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRouter = void 0;
const express_1 = require("express");
const http_1 = require("../utils/http");
const authGuard_1 = require("../utils/authGuard");
const game_1 = require("../state/game");
exports.gameRouter = (0, express_1.Router)();
exports.gameRouter.post("/stations/verify", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const stageId = Number(req.body?.stageId);
    if (!Number.isFinite(stageId) || stageId < 1 || stageId > 6) {
        res
            .status(400)
            .json((0, http_1.badRequest)("INVALID_STAGE_ID", "stageId must be between 1 and 6"));
        return;
    }
    const qrJwt = (0, http_1.normalizeText)(req.body?.qrJwt);
    if (!qrJwt) {
        res.status(400).json((0, http_1.badRequest)("MISSING_QR_JWT", "qrJwt is required"));
        return;
    }
    res.status(200).json({
        ok: true,
        challengeId: (0, game_1.stageIdToChallengeId)(stageId),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        playerId: session.employeeId,
    });
});
exports.gameRouter.get("/challenges/:challengeId", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const challengeId = (0, http_1.normalizeText)(req.params.challengeId);
    const challenge = (0, game_1.getChallenge)(challengeId);
    if (!challenge) {
        res.status(404).json((0, http_1.badRequest)("CHALLENGE_NOT_FOUND", "challenge not found"));
        return;
    }
    res.status(200).json({
        challengeId: challenge.id,
        title: challenge.title,
        options: challenge.options,
    });
});
exports.gameRouter.post("/challenges/:challengeId/attempts", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const challengeId = (0, http_1.normalizeText)(req.params.challengeId);
    if (!(0, game_1.getChallenge)(challengeId)) {
        res.status(404).json((0, http_1.badRequest)("CHALLENGE_NOT_FOUND", "challenge not found"));
        return;
    }
    const choiceId = (0, http_1.normalizeText)(req.body?.choiceId || req.body?.answer);
    if (!choiceId) {
        res
            .status(400)
            .json((0, http_1.badRequest)("INVALID_ATTEMPT_PAYLOAD", "choiceId is required"));
        return;
    }
    const result = (0, game_1.applyAttemptResult)(session.employeeId, challengeId, choiceId);
    res.status(200).json({
        correct: result.correct,
        nextStageId: result.nextStageId,
    });
});
exports.gameRouter.post("/me/playthrough/restart", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const restarted = (0, game_1.restartPlaythrough)(session.employeeId);
    if (!restarted) {
        res.status(409).json((0, http_1.badRequest)("RESTART_NOT_ALLOWED", "restart requires a full clear and remaining rounds"));
        return;
    }
    res.status(200).json(restarted);
});
exports.gameRouter.get("/me/progress", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    res.status(200).json((0, game_1.getOrInitProgress)(session.employeeId));
});
