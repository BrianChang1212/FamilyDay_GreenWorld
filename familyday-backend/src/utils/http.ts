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
