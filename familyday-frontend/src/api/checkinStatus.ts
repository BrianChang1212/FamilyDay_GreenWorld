import { getViteApiBase } from "@/lib/apiBase";
import { authHeaders } from "@/lib/sessionToken";

export type CheckinStatusPayload = {
	checkedIn: boolean;
	checkinAt: string | null;
};

type CheckinStatusJson = {
	checkedIn?: boolean;
	checkinAt?: string;
};

export async function fetchCheckinStatus(
	employeeId?: string,
): Promise<CheckinStatusPayload> {
	const base = getViteApiBase();
	const q = employeeId?.trim()
		? `?employeeId=${encodeURIComponent(employeeId.trim())}`
		: "";
	const res = await fetch(`${base}/api/v1/checkin/status${q}`, {
		credentials: "include",
		headers: { Accept: "application/json", ...authHeaders() },
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`checkin/status ${res.status}: ${text.slice(0, 200)}`);
	}

	const data = (await res.json()) as CheckinStatusJson;
	return {
		checkedIn: data.checkedIn === true,
		checkinAt: typeof data.checkinAt === "string" ? data.checkinAt : null,
	};
}
