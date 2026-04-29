"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertCheckin = upsertCheckin;
exports.getCheckin = getCheckin;
const store_1 = require("../utils/store");
const checkins = new Map();
async function upsertCheckin(record) {
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        await db.collection("checkins").doc(record.employeeId).set(record, { merge: true });
        return;
    }
    checkins.set(record.employeeId, record);
}
async function getCheckin(employeeId) {
    if ((0, store_1.useFirestoreStore)()) {
        const db = (0, store_1.getDb)();
        if (employeeId) {
            const snap = await db.collection("checkins").doc(employeeId).get();
            return snap.exists ? snap.data() : null;
        }
        const q = await db
            .collection("checkins")
            .orderBy("checkinAt", "desc")
            .limit(1)
            .get();
        if (q.empty) {
            return null;
        }
        return q.docs[0].data();
    }
    if (employeeId) {
        return checkins.get(employeeId) ?? null;
    }
    const values = Array.from(checkins.values()).sort((a, b) => b.checkinAt.localeCompare(a.checkinAt));
    return values[0] ?? null;
}
