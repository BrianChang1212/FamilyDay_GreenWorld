"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const employees_1 = require("../data/employees");
const http_1 = require("../utils/http");
const session_1 = require("../utils/session");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/auth/login", (req, res) => {
    const employeeId = (0, http_1.normalizeText)(req.body?.employeeId);
    const name = (0, http_1.normalizeText)(req.body?.name);
    if (!employeeId || !name) {
        res
            .status(400)
            .json((0, http_1.badRequest)("INVALID_AUTH_PAYLOAD", "employeeId and name are required"));
        return;
    }
    const employee = (0, employees_1.findEmployee)(employeeId, name);
    if (!employee) {
        res.status(401).json((0, http_1.badRequest)("AUTH_IDENTITY_MISMATCH", "name and employeeId do not match employee roster"));
        return;
    }
    const token = (0, session_1.createSessionToken)({
        employeeId: employee.employeeId,
        name: employee.name,
        iat: Date.now(),
    });
    res.setHeader("Set-Cookie", (0, session_1.buildSessionCookie)(token));
    res.status(200).json({
        ok: true,
        user: {
            employeeId: employee.employeeId,
            name: employee.name,
        },
    });
});
exports.authRouter.post("/auth/logout", (_req, res) => {
    res.setHeader("Set-Cookie", (0, session_1.buildClearSessionCookie)());
    res.status(200).json({ ok: true });
});
exports.authRouter.get("/auth/me", (req, res) => {
    const raw = (0, http_1.getCookie)(req, (0, session_1.getSessionCookieName)());
    const session = raw ? (0, session_1.verifySessionToken)(raw) : null;
    if (!session) {
        res.status(401).json((0, http_1.badRequest)("UNAUTHORIZED", "missing or invalid session"));
        return;
    }
    res.status(200).json({
        employeeId: session.employeeId,
        name: session.name,
        displayName: session.name,
    });
});
