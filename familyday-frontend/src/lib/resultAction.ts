/**
 * 答題結果頁（ResultView）按鈕決策：依「答對／答錯」、「是否首次全破」、
 * 「是否已是 6/6 重玩」分流至 finish / stage / quiz。
 *
 * 純函式，無 sessionStorage / router 副作用，便於單元測試。
 */

export type ResultActionInput = {
	/** API 回應 `correct === true` 才為 true */
	ok: boolean;
	/** 本次作答從 < TOTAL_STAGES 跨越到 === TOTAL_STAGES（首次達成全破） */
	firstClear: boolean;
	/** 送出題後本地 completedStageIds 是否已達 TOTAL_STAGES（含本次） */
	allCleared: boolean;
};

export type ResultAction = {
	/** i18n key（在 zh-TW.ts 內定義） */
	labelKey:
		| "result.claimRewardButton"
		| "result.backToStageButton"
		| "result.nextButton"
		| "result.retryButton";
	/** vue-router route name */
	target: "finish" | "stage" | "quiz";
};

export function resolveResultAction(input: ResultActionInput): ResultAction {
	if (!input.ok) {
		return { labelKey: "result.retryButton", target: "quiz" };
	}
	if (input.firstClear) {
		return { labelKey: "result.claimRewardButton", target: "finish" };
	}
	if (input.allCleared) {
		return { labelKey: "result.backToStageButton", target: "stage" };
	}
	return { labelKey: "result.nextButton", target: "stage" };
}
