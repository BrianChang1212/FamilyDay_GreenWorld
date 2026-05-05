import { Router } from "express";
import { loadFdgwProject, getTotalStages } from "../config/fdgwProject";
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
	const dash = loadFdgwProject().dashboard;
	const stageRows = dash.stages;
	const total = getTotalStages();
	/* 任意順序：未完成皆可作答；`locked` 表示該站已通關（不需再解鎖進度） */
	const stages = stageRows.map((s) => ({
		id: s.id,
		title: s.title,
		order: s.id,
		locked: done.has(s.id),
	}));

	res.status(200).json({
		event: {
			id: dash.eventSlug,
			name: dash.eventDisplayName,
		},
		stages,
		progress: {
			currentStageId: progress.currentStageId,
			completedStageIds: progress.completedStageIds,
			allCompleted: progress.completedStageIds.length >= total,
			fullClearCount: progress.fullClearCount,
			rewardRedeemCount: progress.rewardRedeemCount,
			canStartNewRound: progress.completedStageIds.length >= total,
			maxRounds: progress.maxRounds,
			player: {
				employeeId: session.employeeId,
				name: session.name,
			},
		},
	});
});
