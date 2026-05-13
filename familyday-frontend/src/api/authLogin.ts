import { getViteApiBase } from "@/lib/apiBase";
import { setSessionToken } from "@/lib/sessionToken";

/** POST /api/v1/auth/login — stores bearer token in sessionStorage. */
export async function loginGame(
	name: string,
	employeeId: string,
): Promise<void> {
	const base = getViteApiBase();
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

	const data = (await res.json()) as { token?: string };
	if (typeof data.token === "string" && data.token) {
		setSessionToken(data.token);
	}
}
