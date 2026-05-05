import { getViteApiBase } from "@/lib/apiBase";

export type SubmitCheckinInput = {
	name: string;
	employeeId: string;
	partySize: number;
};

/**
 * POST /api/v1/checkin. When VITE_API_BASE is unset, returns without calling the API
 * (matches CheckInFormView offline/demo behavior).
 */
export async function submitCheckin(input: SubmitCheckinInput): Promise<void> {
	const base = getViteApiBase();
	if (!base) {
		return;
	}

	const res = await fetch(`${base}/api/v1/checkin`, {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: input.name,
			employeeId: input.employeeId,
			partySize: input.partySize,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`checkin ${res.status}: ${text.slice(0, 200)}`);
	}
}
