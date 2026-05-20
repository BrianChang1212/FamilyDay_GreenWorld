import { GAME_CONFIG } from "@/constants";

/**
 * QR payload → 站台編號 (1…TOTAL_STAGES)。
 *
 * 支援格式：
 *   - Mock token：`stage-{n}-token`
 *   - 三段式 JWT：base64url payload 內含 `stageId` / `stage_id` / `sid`
 *   - URL（外部相機掃描，活動正式 QR）：
 *       `https://<host>/scan?t=<JWT or stage-N-token>`
 *       `https://<host>/scan?stage=<N>`
 */

const MOCK_TOKEN_RE = /^stage-(\d+)-token$/;

function clampStageId(n: number): number | null {
	return Number.isFinite(n) &&
		n >= GAME_CONFIG.MIN_STAGE &&
		n <= GAME_CONFIG.TOTAL_STAGES
		? n
		: null;
}

function decodeMockToken(token: string): number | null {
	const m = MOCK_TOKEN_RE.exec(token);
	if (!m) return null;
	return clampStageId(Number(m[1]));
}

function decodeJwtStageId(token: string): number | null {
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	try {
		const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const json = JSON.parse(atob(padded)) as Record<string, unknown>;
		const raw = json.stageId ?? json.stage_id ?? json.sid;
		return clampStageId(Number(raw));
	} catch {
		return null;
	}
}

function decodeBareToken(token: string): number | null {
	return decodeMockToken(token) ?? decodeJwtStageId(token);
}

function decodeUrlToken(token: string): number | null {
	let url: URL;
	try {
		url = new URL(token);
	} catch {
		return null;
	}
	const t = url.searchParams.get("t");
	if (t) {
		const fromInner = decodeBareToken(t.trim());
		if (fromInner !== null) return fromInner;
	}
	const stage = url.searchParams.get("stage");
	if (stage !== null) {
		return clampStageId(Number(stage));
	}
	return null;
}

export function extractQrStageId(rawPayload: string): number | null {
	const token = rawPayload.trim();
	if (!token) return null;
	if (/^https?:\/\//i.test(token)) return decodeUrlToken(token);
	return decodeBareToken(token);
}
