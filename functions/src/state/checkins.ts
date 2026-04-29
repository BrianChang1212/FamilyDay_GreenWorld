export type CheckinRecord = {
	employeeId: string;
	name: string;
	partySize: number;
	checkinAt: string;
};

const checkins = new Map<string, CheckinRecord>();

export function upsertCheckin(record: CheckinRecord): void {
	checkins.set(record.employeeId, record);
}

export function getCheckin(employeeId?: string): CheckinRecord | null {
	if (employeeId) {
		return checkins.get(employeeId) ?? null;
	}
	const values = Array.from(checkins.values()).sort((a, b) =>
		b.checkinAt.localeCompare(a.checkinAt),
	);
	return values[0] ?? null;
}
