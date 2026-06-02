import { Router } from "express";
import { lookupRosterByEmployeeId, verifyRosterIdentity } from "../state/roster";
import { getCheckin, upsertCheckin } from "../state/checkins";
import { badRequest, normalizeText, toNonNegativeInt } from "../utils/http";

export const checkinRouter = Router();

checkinRouter.post("/checkin", async (req, res) => {
	try {
		const employeeId = normalizeText(req.body?.employeeId);
		const name = normalizeText(req.body?.name);
		// partySize 允許 0(同行人數,0 = 沒有攜伴)
		const partySizeRaw = req.body?.partySize;
		const partySizeMissing = partySizeRaw === undefined || partySizeRaw === null || partySizeRaw === "";
		const partySize = toNonNegativeInt(partySizeRaw);
		if (!employeeId || !name || partySizeMissing || partySize < 0 || !Number.isFinite(partySize)) {
			res.status(400).json(
				badRequest(
					"INVALID_CHECKIN_PAYLOAD",
					"employeeId, name, partySize are required",
				),
			);
			return;
		}

		const employee = await verifyRosterIdentity(employeeId, name);
		if (!employee) {
			res.status(401).json(
				badRequest(
					"CHECKIN_IDENTITY_MISMATCH",
					"name and employeeId do not match Firestore roster",
				),
			);
			return;
		}

		const now = new Date().toISOString();
		await upsertCheckin({
			employeeId: employee.employeeId,
			name: employee.name,
			partySize,
			checkinAt: now,
		});
		res.status(200).json({
			ok: true,
			checkinId: `checkin_${employee.employeeId}`,
			checkinAt: now,
		});
	} catch {
		res
			.status(500)
			.json(badRequest("CHECKIN_BACKEND_ERROR", "failed to validate roster"));
	}
});

checkinRouter.get("/checkin/roster-lookup", async (req, res) => {
	const employeeId = normalizeText(req.query.employeeId);
	if (!employeeId) {
		res.status(400).json(badRequest("MISSING_EMPLOYEE_ID", "employeeId is required"));
		return;
	}
	const result = await lookupRosterByEmployeeId(employeeId);
	if (!result) {
		res.status(404).json(badRequest("EMPLOYEE_NOT_FOUND", "employeeId not found in roster"));
		return;
	}
	res.status(200).json({ ok: true, employeeId: result.employeeId, name: result.name });
});

checkinRouter.get("/checkin/status", async (req, res) => {
	const employeeId = normalizeText(req.query.employeeId);
	const found = await getCheckin(employeeId || undefined);
	if (!found) {
		res.status(200).json({
			checkedIn: false,
			checkinAt: null,
		});
		return;
	}
	res.status(200).json({
		checkedIn: true,
		checkinAt: found.checkinAt,
		employeeId: found.employeeId,
		name: found.name,
		partySize: found.partySize,
	});
});
