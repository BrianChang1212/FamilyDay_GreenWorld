import { STORAGE_KEYS } from "@/constants";

const KEY = STORAGE_KEYS.sessionToken;

export function setSessionToken(token: string): void {
	sessionStorage.setItem(KEY, token);
}

export function getSessionToken(): string {
	return sessionStorage.getItem(KEY) ?? "";
}

export function clearSessionToken(): void {
	sessionStorage.removeItem(KEY);
}

export function authHeaders(): Record<string, string> {
	const token = getSessionToken();
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}
