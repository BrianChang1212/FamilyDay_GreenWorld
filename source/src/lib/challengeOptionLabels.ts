import { GAME_CONFIG } from "@/constants";
import { getStageQuiz } from "@/lib/stageQuestions";

const ABCD = new Set(["A", "B", "C", "D"]);

export function apiOptionsAreAbcdKeys(options: string[]): boolean {
	return (
		options.length === 4 && options.every((o) => typeof o === "string" && ABCD.has(o))
	);
}

function stageIndexFromChallengeId(challengeId: string): number | null {
	const m = /^c(\d+)$/i.exec(challengeId.trim());
	if (!m) {
		return null;
	}
	const n = parseInt(m[1], 10);
	if (
		!Number.isFinite(n) ||
		n < GAME_CONFIG.MIN_STAGE ||
		n > GAME_CONFIG.TOTAL_STAGES
	) {
		return null;
	}
	return n;
}

/** 題幹：有本地 `c1`…`c6` 題庫時以前端文案為準，否則用 API 的 title */
export function questionForChallenge(
	challengeId: string,
	apiTitle: string,
): string {
	const n = stageIndexFromChallengeId(challengeId);
	if (n !== null) {
		return getStageQuiz(n).question;
	}
	return apiTitle;
}

/** 每列：送 API 的 key（choiceId）與畫面顯示的 label */
export function choiceRowsForChallenge(
	challengeId: string,
	apiOptions: string[],
): { key: string; label: string }[] {
	const keys =
		apiOptions.length > 0
			? apiOptions
			: stageIndexFromChallengeId(challengeId) !== null
				? ["A", "B", "C", "D"]
				: [];

	if (keys.length === 0) {
		return [];
	}

	if (apiOptionsAreAbcdKeys(keys)) {
		const n = stageIndexFromChallengeId(challengeId);
		if (n !== null) {
			const labels = getStageQuiz(n).options;
			return keys.map((key, i) => ({
				key,
				label: labels[i] ?? key,
			}));
		}
	}
	return keys.map((key) => ({ key, label: key }));
}
