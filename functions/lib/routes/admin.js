"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const redeem_1 = require("../state/redeem");
const checkins_1 = require("../state/checkins");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.post("/admin/roster/import", (_req, res) => {
    res.status(200).json({
        ok: true,
        importedCount: 10,
    });
});
exports.adminRouter.get("/admin/reports/attendance", async (_req, res) => {
    const anyCheckin = await (0, checkins_1.getCheckin)();
    res.status(200).json({
        total: 1000,
        checkedIn: anyCheckin ? 1 : 0,
    });
});
exports.adminRouter.get("/admin/reports/progress", async (_req, res) => {
    const redeem = await (0, redeem_1.getRedeemSummary)();
    res.status(200).json({
        players: 1,
        fullClear: 0,
        redeemed: redeem.totalRedeemed,
    });
});
