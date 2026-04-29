import { Router } from "express";
import { badRequest, getCookie } from "../utils/http";
import { getSessionCookieName, verifySessionToken } from "../utils/session";
import { getOrInitProgress } from "../state/game";

export const dashboardRouter = Router();

dashboardRouter.get("/me/dashboard", (req, res) => {
	const raw = getCookie(req, getSessionCookieName());
	const session = raw ? verifySessionToken(raw) : null;
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}
	const progress = getOrInitProgress(session.employeeId);

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
