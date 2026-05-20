import { getViteApiBase } from "@/lib/apiBase";

export type RosterLookupPayload = {
	employeeId: string;
	name: string;
};

export async function fetchRosterLookup(employeeId: string): Promise<RosterLookupPayload | null> {
	const base = getViteApiBase();
	const res = await fetch(
		`${base}/api/v1/checkin/roster-lookup?employeeId=${encodeURIComponent(employeeId.trim())}`,
		{ credentials: "include", headers: { Accept: "application/json" } },
	);
	if (res.status === 404) return null;
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`roster-lookup ${res.status}: ${text.slice(0, 200)}`);
	}
	const data = (await res.json()) as { employeeId: string; name: string };
	return { employeeId: data.employeeId, name: data.name };
}
