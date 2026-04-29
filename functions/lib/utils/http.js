"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequest = badRequest;
exports.normalizeText = normalizeText;
exports.toPositiveInt = toPositiveInt;
exports.getCookie = getCookie;
function badRequest(code, message) {
    return { code, message };
}
function normalizeText(v) {
    return String(v ?? "").trim();
}
function toPositiveInt(v, fallback = 1) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) {
        return fallback;
    }
    return Math.floor(n);
}
function getCookie(req, key) {
    const raw = req.headers.cookie;
    if (!raw) {
        return "";
    }
    const parts = raw.split(";").map((v) => v.trim());
    const pair = parts.find((v) => v.startsWith(`${key}=`));
    if (!pair) {
        return "";
    }
    return decodeURIComponent(pair.slice(key.length + 1));
}
