import { Router } from "express";
import { findEmployee } from "../data/employees";
import { getCheckin, upsertCheckin } from "../state/checkins";
import { badRequest, normalizeText, toPositiveInt } from "../utils/http";

export const checkinRouter = Router();

checkinRouter.post("/checkin", async (req, res) => {
	const employeeId = normalizeText(req.body?.employeeId);
	const name = normalizeText(req.body?.name);
	const partySize = toPositiveInt(req.body?.partySize);
	if (!employeeId || !name || !partySize) {
		res.status(400).json(
			badRequest(
				"INVALID_CHECKIN_PAYLOAD",
				"employeeId, name, partySize are required",
			),
		);
		return;
	}

	const employee = findEmployee(employeeId, name);
	if (!employee) {
		res.status(401).json(
			badRequest(
				"CHECKIN_IDENTITY_MISMATCH",
				"name and employeeId do not match employee roster",
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
