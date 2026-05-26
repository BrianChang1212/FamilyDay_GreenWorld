import { STORAGE_KEYS } from "@/constants";

const KEY = STORAGE_KEYS.sessionToken;

/*
 * localStorage（非 sessionStorage）：sessionStorage 綁定單一分頁，外部相機掃
 * QR 多半在新分頁/內建瀏覽器開啟，會讀不到原分頁的 token 而被迫重登。改用
 * localStorage 讓同一瀏覽器跨分頁共享登入狀態（iOS Safari / Android Chrome 皆適用）。
 */
export function setSessionToken(token: string): void {
	localStorage.setItem(KEY, token);
}

export function getSessionToken(): string {
	return localStorage.getItem(KEY) ?? "";
}

export function clearSessionToken(): void {
	localStorage.removeItem(KEY);
}

export function authHeaders(): Record<string, string> {
	const token = getSessionToken();
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}
