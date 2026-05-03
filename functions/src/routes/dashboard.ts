import { Router } from "express";
import { badRequest, getCookie } from "../utils/http";
import { getSessionCookieName, verifySessionToken } from "../utils/session";
import { getOrInitProgress } from "../state/game";

export const dashboardRouter = Router();

dashboardRouter.get("/me/dashboard", async (req, res) => {
	const raw = getCookie(req, getSessionCookieName());
	const session = raw ? verifySessionToken(raw) : null;
	if (!session) {
		res.status(401).json(badRequest("UNAUTHORIZED", "missing or invalid session"));
		return;
	}
	const progress = await getOrInitProgress(session.employeeId);
	const done = new Set(progress.completedStageIds);
	const stageRows = [
		{ id: 1, title: "水鳥區" },
		{ id: 2, title: "大探奇區" },
		{ id: 3, title: "水生植物公園" },
		{ id: 4, title: "鳥園" },
		{ id: 5, title: "蝴蝶園" },
		{ id: 6, title: "生物多樣性探索區" },
	];
	/* 任意順序：未完成皆可作答；`locked` 表示該站已通關（不需再解鎖進度） */
	const stages = stageRows.map((s) => ({
		id: s.id,
		title: s.title,
		order: s.id,
		locked: done.has(s.id),
	}));

	res.status(200).json({
		event: {
			id: "greenworld-2026",
			name: "瑞軒家庭日",
		},
		stages,
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
