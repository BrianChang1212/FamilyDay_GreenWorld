"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionUser = getSessionUser;
const http_1 = require("./http");
const session_1 = require("./session");
function getSessionUser(req) {
    const raw = (0, http_1.getCookie)(req, (0, session_1.getSessionCookieName)());
    const session = raw ? (0, session_1.verifySessionToken)(raw) : null;
    if (!session) {
        return null;
    }
    return session;
}
