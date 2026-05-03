import { getDb } from "../utils/store";

export type RosterRecord = {
	eventId: string;
	employeeId: string;
	name: string;
	partySizePlanned?: number;
	source: "import" | "manual";
	updatedAt: string;
};

type RosterIdentity = {
	eventId: string;
	employeeId: string;
	name: string;
};

function getEventId(): string {
	return process.env.FDGW_EVENT_ID || "familyday-2026";
}

function rosterDocId(eventId: string, employeeId: string): string {
	return `${eventId}_${employeeId}`;
}

export async function verifyRosterIdentity(
	employeeId: string,
	name: string,
): Promise<RosterIdentity | null> {
	const eventId = getEventId();
	const db = getDb();
	const snap = await db.collection("roster").doc(rosterDocId(eventId, employeeId)).get();
	if (!snap.exists) {
		return null;
	}
	const data = snap.data() as Partial<RosterRecord> | undefined;
	if (!data || data.name !== name) {
		return null;
	}
	return {
		eventId,
		employeeId,
		name,
	};
}

export async function upsertRosterEntries(
	items: Array<{ employeeId: string; name: string; partySizePlanned?: number }>,
	source: "import" | "manual" = "import",
): Promise<number> {
	const eventId = getEventId();
	const db = getDb();
	const batch = db.batch();
	let importedCount = 0;
	for (const item of items) {
		const employeeId = (item.employeeId || "").trim();
		const name = (item.name || "").trim();
		if (!employeeId || !name) {
			continue;
		}
		const ref = db.collection("roster").doc(rosterDocId(eventId, employeeId));
		batch.set(
			ref,
			{
				eventId,
				employeeId,
				name,
				partySizePlanned: item.partySizePlanned,
				source,
				updatedAt: new Date().toISOString(),
			} as RosterRecord,
			{ merge: true },
		);
		importedCount += 1;
	}
	if (importedCount > 0) {
		await batch.commit();
	}
	return importedCount;
}
