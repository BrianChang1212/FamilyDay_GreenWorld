import type { Request } from "express";

export type ApiErrorBody = {
	code: string;
	message: string;
};

export function badRequest(code: string, message: string): ApiErrorBody {
	return { code, message };
}

export function normalizeText(v: unknown): string {
	return String(v ?? "").trim();
}

export function toPositiveInt(v: unknown, fallback = 1): number {
	const n = Number(v);
	if (!Number.isFinite(n) || n < 1) {
		return fallback;
	}
	return Math.floor(n);
}

/**
 * 接受 0 與正整數。輸入 undefined / 空字串 / NaN / 負數 → 回 fallback。
 * 用於 partySize（同行人數，0 = 沒有攜伴）這類「0 為合法值」的欄位。
 */
export function toNonNegativeInt(v: unknown, fallback = 0): number {
	if (v === undefined || v === null || v === "") {
		return fallback;
	}
	const n = Number(v);
	if (!Number.isFinite(n) || n < 0) {
		return fallback;
	}
	return Math.floor(n);
}

export function getCookie(req: Request, key: string): string {
	const raw = req.headers.cookie;
	if (!raw) {
		return "";
	}
	const parts = raw.split(";").map((v) => v.trim());
	const pair = parts.find((v) => v.startsWith(`${key}=`));
	if (!pair) {
		return "";
	}
	return decodeURIComponent(pair.slice(key.length + 1));
}
