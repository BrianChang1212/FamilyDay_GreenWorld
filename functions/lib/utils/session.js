"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
exports.buildSessionCookie = buildSessionCookie;
exports.buildClearSessionCookie = buildClearSessionCookie;
exports.getSessionCookieName = getSessionCookieName;
const node_crypto_1 = __importDefault(require("node:crypto"));
const COOKIE_NAME = "fdgw_session";
function base64url(input) {
    return Buffer.from(input, "utf8").toString("base64url");
}
function fromBase64url(input) {
    return Buffer.from(input, "base64url").toString("utf8");
}
function getSecret() {
    return process.env.FDGW_SESSION_SECRET || "fdgw-dev-only-secret";
}
function signature(data) {
    return node_crypto_1.default
        .createHmac("sha256", getSecret())
        .update(data)
        .digest("base64url");
}
function createSessionToken(payload) {
    const data = base64url(JSON.stringify(payload));
    return `${data}.${signature(data)}`;
}
function verifySessionToken(token) {
    const [data, sig] = token.split(".");
    if (!data || !sig) {
        return null;
    }
    if (signature(data) !== sig) {
        return null;
    }
    try {
        const parsed = JSON.parse(fromBase64url(data));
        if (!parsed.employeeId || !parsed.name || !parsed.iat) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
function buildSessionCookie(token) {
    return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`;
}
function buildClearSessionCookie() {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
function getSessionCookieName() {
    return COOKIE_NAME;
}
