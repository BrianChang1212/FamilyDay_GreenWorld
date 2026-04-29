"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = require("express");
const redeem_1 = require("../state/redeem");
const http_1 = require("../utils/http");
const authGuard_1 = require("../utils/authGuard");
exports.staffRouter = (0, express_1.Router)();
exports.staffRouter.post("/staff/redeem/token", (req, res) => {
    const session = (0, authGuard_1.getSessionUser)(req);
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    const issued = (0, redeem_1.issueRedeemToken)(session.employeeId, 300);
    res.status(200).json(issued);
});
exports.staffRouter.post("/staff/redeem/confirm", (req, res) => {
    const staffId = (0, http_1.normalizeText)(req.body?.staffId);
    const token = (0, http_1.normalizeText)(req.body?.token);
    if (!staffId || !token) {
        res
            .status(400)
            .json((0, http_1.badRequest)("INVALID_REDEEM_CONFIRM", "staffId and token are required"));
        return;
    }
    const confirmed = (0, redeem_1.confirmRedeem)(token, staffId);
    if (!confirmed.ok) {
        res.status(409).json((0, http_1.badRequest)(confirmed.code, confirmed.message));
        return;
    }
    res.status(200).json(confirmed);
});
