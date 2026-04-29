"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertCheckin = upsertCheckin;
exports.getCheckin = getCheckin;
const checkins = new Map();
function upsertCheckin(record) {
    checkins.set(record.employeeId, record);
}
function getCheckin(employeeId) {
    if (employeeId) {
        return checkins.get(employeeId) ?? null;
    }
    const values = Array.from(checkins.values()).sort((a, b) => b.checkinAt.localeCompare(a.checkinAt));
    return values[0] ?? null;
}
