"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueRedeemToken = issueRedeemToken;
exports.confirmRedeem = confirmRedeem;
exports.getRedeemSummary = getRedeemSummary;
const store_1 = require("../utils/store");
const tokenStore = new Map();
const redeemedByEmployee = new Map();
function randomToken() {
    return `redeem_${Math.random().toString(36).slice(2, 12)}`;
}
async function issueRedeemToken(employeeId, ttlSec = 300) {
    const token = randomToken();
    const expiresAtMs = Date.now() + ttlSec * 1000;
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        await db
            .collection("redeem_tokens")
            .doc(token)
            .set({ token, employeeId, expiresAtMs }, { merge: true });
        return { token, expiresInSec: ttlSec };
    }
    tokenStore.set(token, { token, employeeId, expiresAtMs });
    return { token, expiresInSec: ttlSec };
}
async function confirmRedeem(token, staffId) {
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        const snap = await db.collection("redeem_tokens").doc(token).get();
        if (!snap.exists) {
            return {
                ok: false,
                code: "INVALID_REDEEM_TOKEN",
                message: "redeem token not found",
            };
        }
        const found = snap.data();
        if (found.expiresAtMs < Date.now()) {
            await db.collection("redeem_tokens").doc(token).delete();
            return {
                ok: false,
                code: "EXPIRED_REDEEM_TOKEN",
                message: "redeem token expired",
            };
        }
        const existed = await db.collection("redeem_records").doc(found.employeeId).get();
        if (existed.exists) {
            return {
                ok: false,
                code: "ALREADY_REDEEMED",
                message: "reward already redeemed",
            };
        }
        const redeemId = `redeem_${found.employeeId}_${Date.now()}`;
        await db.collection("redeem_records").doc(found.employeeId).set({
            redeemId,
            employeeId: found.employeeId,
            staffId,
            confirmedAt: new Date().toISOString(),
        });
        await db.collection("redeem_tokens").doc(token).delete();
        return { ok: true, redeemId };
    }
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
async function getRedeemSummary() {
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        const v = await db.collection("redeem_records").count().get();
        return { totalRedeemed: v.data().count };
    }
    return { totalRedeemed: redeemedByEmployee.size };
}
