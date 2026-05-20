import { challengeIdForStage } from "@/lib/challengeOptionLabels";
import { extractQrStageId } from "@/lib/qrPayload";

/**
 * `/scan` 路由的純決策層：把 query (`t` / `stage`) 還原為站台與對應 challengeId。
 * 不做任何 sessionStorage 寫入；由 router redirect 負責側效。
 */

export type ScanIntent =
	| { type: "invalid" }
	| { type: "valid"; stageId: number; challengeId: string };

function asString(v: unknown): string {
	return typeof v === "string" ? v.trim() : "";
}

export function resolveScanIntent(query: {
	t?: unknown;
	stage?: unknown;
}): ScanIntent {
	const t = asString(query.t);
	const stageStr = asString(query.stage);

	let stageId: number | null = null;
	if (t) stageId = extractQrStageId(t);
	if (stageId === null && stageStr) {
		stageId = extractQrStageId(
			`https://scan.local/?stage=${encodeURIComponent(stageStr)}`,
		);
	}
	if (stageId === null) return { type: "invalid" };

	const challengeId = challengeIdForStage(stageId);
	if (!challengeId) return { type: "invalid" };

	return { type: "valid", stageId, challengeId };
}
