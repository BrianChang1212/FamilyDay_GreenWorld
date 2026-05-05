/**
 * 2026 瑞軒家庭日 - 全域常數（數值／文案來自倉庫根目錄 fdgw.project.json）
 */
import fdgw from "../../fdgw.project.json";

const b = fdgw.branding;
const g = fdgw.game;

export const APP_CONFIG = {
	YEAR: b.year,
	COMPANY_NAME: b.companyName,
	EVENT_NAME: b.eventTitle,
	LOCATION: b.location,
	MAX_COMPANIONS: b.maxCompanions,
	MAX_REWARD_CLAIMS: g.maxRewardRounds,
	DEFAULT_PLAYER_NAME: b.defaultPlayerName,
	COPYRIGHT: b.copyright,
};

/** 闖關禮可領取次數上限（完成頁／領取成功頁與後端 dashboard 預設對齊） */
export const FINISH_REWARD_SLOTS = APP_CONFIG.MAX_REWARD_CLAIMS;

export const GAME_CONFIG = {
	MIN_STAGE: g.minStage,
	TOTAL_STAGES: g.totalStages,
};

export const STORAGE_KEYS = {
	stage: "fdgw_stage",
	/** JSON number[]：已答對的站點 id，任意順序通關 */
	completedStageIds: "fdgw_completed_stage_ids",
	name: "fdgw_name",
	employeeId: "fdgw_employeeId",
	inZone: "fdgw_inZone",
	/** 本站掃碼驗證後暫存的 challengeId（與 stage 綁定，避免 inZone 與題組不一致） */
	pendingStationChallenge: "fdgw_pending_station_challenge",
	finishClaimed: "fdgw_finishClaimed",
	companionCount: "fdgw_companionCount",
	checkinDone: "fdgw_checkin_done",
	entryIntent: "fdgw_entry_intent",
} as const;
