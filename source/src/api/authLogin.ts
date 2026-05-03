import { getViteApiBase } from "@/lib/apiBase";

/** POST /api/v1/auth/login — establishes session cookie. */
export async function loginGame(
	name: string,
	employeeId: string,
): Promise<void> {
	const base = getViteApiBase();
	if (!base) {
		throw new Error("VITE_API_BASE is not configured");
	}

	const res = await fetch(`${base}/api/v1/auth/login`, {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name,
			employeeId,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`auth/login ${res.status}: ${text.slice(0, 200)}`);
	}
}
