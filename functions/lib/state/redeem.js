"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueRedeemToken = issueRedeemToken;
exports.confirmRedeem = confirmRedeem;
exports.getRedeemSummary = getRedeemSummary;
const tokenStore = new Map();
const redeemedByEmployee = new Map();
function randomToken() {
    return `redeem_${Math.random().toString(36).slice(2, 12)}`;
}
function issueRedeemToken(employeeId, ttlSec = 300) {
    const token = randomToken();
    const expiresAtMs = Date.now() + ttlSec * 1000;
    tokenStore.set(token, { token, employeeId, expiresAtMs });
    return { token, expiresInSec: ttlSec };
}
function confirmRedeem(token, staffId) {
    const found = tokenStore.get(token);
    if (!found) {
        return { ok: false, code: "INVALID_REDEEM_TOKEN", message: "redeem token not found" };
    }
    if (found.expiresAtMs < Date.now()) {
        tokenStore.delete(token);
        return { ok: false, code: "EXPIRED_REDEEM_TOKEN", message: "redeem token expired" };
    }
    if (redeemedByEmployee.has(found.employeeId)) {
        return { ok: false, code: "ALREADY_REDEEMED", message: "reward already redeemed" };
    }
    const redeemId = `redeem_${found.employeeId}_${Date.now()}`;
    redeemedByEmployee.set(found.employeeId, {
        redeemId,
        employeeId: found.employeeId,
        staffId,
        confirmedAt: new Date().toISOString(),
    });
    tokenStore.delete(token);
    return { ok: true, redeemId };
}
function getRedeemSummary() {
    return { totalRedeemed: redeemedByEmployee.size };
}
