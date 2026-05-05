import { getDb, useFirestoreStore } from "../utils/store";

export type CheckinRecord = {
	employeeId: string;
	name: string;
	partySize: number;
	checkinAt: string;
};

const checkins = new Map<string, CheckinRecord>();

export async function upsertCheckin(record: CheckinRecord): Promise<void> {
	if (useFirestoreStore()) {
		const db = getDb();
		await db.collection("checkins").doc(record.employeeId).set(record, { merge: true });
		return;
	}
	checkins.set(record.employeeId, record);
}

export async function getCheckin(employeeId?: string): Promise<CheckinRecord | null> {
	if (useFirestoreStore()) {
		const db = getDb();
		if (employeeId) {
			const snap = await db.collection("checkins").doc(employeeId).get();
			return snap.exists ? (snap.data() as CheckinRecord) : null;
		}
		const q = await db
			.collection("checkins")
			.orderBy("checkinAt", "desc")
			.limit(1)
			.get();
		if (q.empty) {
			return null;
		}
		return q.docs[0].data() as CheckinRecord;
	}
	if (employeeId) {
		return checkins.get(employeeId) ?? null;
	}
	const values = Array.from(checkins.values()).sort((a, b) =>
		b.checkinAt.localeCompare(a.checkinAt),
	);
	return values[0] ?? null;
}
