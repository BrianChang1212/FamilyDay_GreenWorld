"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const http_1 = require("../utils/http");
const session_1 = require("../utils/session");
const game_1 = require("../state/game");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get("/me/dashboard", (req, res) => {
    const raw = (0, http_1.getCookie)(req, (0, session_1.getSessionCookieName)());
    const session = raw ? (0, session_1.verifySessionToken)(raw) : null;
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const progress = (0, game_1.getOrInitProgress)(session.employeeId);
    res.status(200).json({
        event: {
            id: "greenworld-2026",
            name: "瑞軒家庭日",
        },
        stages: [
            { id: 1, title: "水鳥區", order: 1, locked: false },
            { id: 2, title: "大探奇區", order: 2, locked: true },
            { id: 3, title: "水生植物公園", order: 3, locked: true },
            { id: 4, title: "鳥園", order: 4, locked: true },
            { id: 5, title: "蝴蝶園", order: 5, locked: true },
            { id: 6, title: "生物多樣性探索區", order: 6, locked: true },
        ],
        progress: {
            currentStageId: progress.currentStageId,
            completedStageIds: progress.completedStageIds,
            allCompleted: progress.completedStageIds.length >= 6,
            fullClearCount: progress.fullClearCount,
            rewardRedeemCount: progress.rewardRedeemCount,
            canStartNewRound: progress.completedStageIds.length >= 6,
            maxRounds: progress.maxRounds,
            player: {
                employeeId: session.employeeId,
                name: session.name,
            },
        },
    });
});
