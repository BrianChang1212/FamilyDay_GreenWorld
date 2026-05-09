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
	/** 闖關禮領取上限（輪數）；不同於「可玩幾輪關卡」—後者無此常數限制 */
	MAX_REWARD_CLAIMS: g.maxRewardRounds,
	DEFAULT_PLAYER_NAME: b.defaultPlayerName,
	COPYRIGHT: b.copyright,
};

/** 終點闖關禮「領取」次數上限（`fdgw.game.maxRewardRounds`／後端）。僅領獎有此限制；關卡通關可重複、登入重製進度不影響此計數。 */
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
	/** 使用者已於 `/checkin/welcome` 點過「開始探索」，才可進 `/checkin` 表單 */
	checkinWelcomePassed: "fdgw_checkin_welcome_passed",
	entryIntent: "fdgw_entry_intent",
} as const;
