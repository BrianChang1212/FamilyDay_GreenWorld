"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkinRouter = void 0;
const express_1 = require("express");
const employees_1 = require("../data/employees");
const checkins_1 = require("../state/checkins");
const http_1 = require("../utils/http");
exports.checkinRouter = (0, express_1.Router)();
exports.checkinRouter.post("/checkin", (req, res) => {
    const employeeId = (0, http_1.normalizeText)(req.body?.employeeId);
    const name = (0, http_1.normalizeText)(req.body?.name);
    const partySize = (0, http_1.toPositiveInt)(req.body?.partySize);
    if (!employeeId || !name || !partySize) {
        res.status(400).json((0, http_1.badRequest)("INVALID_CHECKIN_PAYLOAD", "employeeId, name, partySize are required"));
        return;
    }
    const employee = (0, employees_1.findEmployee)(employeeId, name);
    if (!employee) {
        res.status(401).json((0, http_1.badRequest)("CHECKIN_IDENTITY_MISMATCH", "name and employeeId do not match employee roster"));
        return;
    }
    const now = new Date().toISOString();
    (0, checkins_1.upsertCheckin)({
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
exports.checkinRouter.get("/checkin/status", (req, res) => {
    const employeeId = (0, http_1.normalizeText)(req.query.employeeId);
    const found = (0, checkins_1.getCheckin)(employeeId || undefined);
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
