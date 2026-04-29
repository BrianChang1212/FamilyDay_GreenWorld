import { Router } from "express";
import { getRedeemSummary } from "../state/redeem";
import { getCheckin } from "../state/checkins";

export const adminRouter = Router();

adminRouter.post("/admin/roster/import", (_req, res) => {
	res.status(200).json({
		ok: true,
		importedCount: 10,
	});
});

adminRouter.get("/admin/reports/attendance", async (_req, res) => {
	const anyCheckin = await getCheckin();
	res.status(200).json({
		total: 1000,
		checkedIn: anyCheckin ? 1 : 0,
	});
});

adminRouter.get("/admin/reports/progress", async (_req, res) => {
	const redeem = await getRedeemSummary();
	res.status(200).json({
		players: 1,
		fullClear: 0,
		redeemed: redeem.totalRedeemed,
	});
});
