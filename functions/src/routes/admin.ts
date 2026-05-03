import { Router } from "express";
import { getRedeemSummary } from "../state/redeem";
import { getCheckin } from "../state/checkins";
import { upsertRosterEntries } from "../state/roster";
import { badRequest } from "../utils/http";

export const adminRouter = Router();

adminRouter.post("/admin/roster/import", async (req, res) => {
	try {
		const itemsRaw = req.body?.items;
		if (!Array.isArray(itemsRaw)) {
			res.status(400).json(
				badRequest("INVALID_ROSTER_PAYLOAD", "items array is required"),
			);
			return;
		}
		const importedCount = await upsertRosterEntries(itemsRaw, "import");
		res.status(200).json({
			ok: true,
			importedCount,
		});
	} catch {
		res.status(500).json(
			badRequest("ROSTER_IMPORT_BACKEND_ERROR", "failed to import Firestore roster"),
		);
	}
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
