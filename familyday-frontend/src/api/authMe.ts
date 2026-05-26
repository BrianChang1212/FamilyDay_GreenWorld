import { getViteApiBase } from "@/lib/apiBase";
import { authHeaders } from "@/lib/sessionToken";

export type AuthMe = { employeeId: string; name: string };

/**
 * GET /api/v1/auth/me — 回傳目前 session 使用者；未登入回 null。
 *
 * 同時送 Bearer（若有）與跨站 cookie（`credentials: "include"`），所以在「無
 * 本地 token 但 cookie 仍有效」的情境（例如相機在新分頁開啟）也能解出登入身分，
 * 用來避免已登入者被迫重新輸入員編。
 */
export async function fetchAuthMe(): Promise<AuthMe | null> {
	const base = getViteApiBase();
	try {
		const res = await fetch(`${base}/api/v1/auth/me`, {
			credentials: "include",
			headers: { Accept: "application/json", ...authHeaders() },
		});
		if (!res.ok) {
			return null;
		}
		const data = (await res.json()) as { employeeId?: string; name?: string };
		if (typeof data.employeeId === "string" && data.employeeId) {
			return { employeeId: data.employeeId, name: data.name ?? "" };
		}
		return null;
	} catch {
		return null;
	}
}
