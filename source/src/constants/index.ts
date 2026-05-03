/**
 * 2026 瑞軒家庭日 - 全域常數定義
 */

export const APP_CONFIG = {
  YEAR: '2026',
  COMPANY_NAME: '瑞軒科技',
  EVENT_NAME: '2026 瑞軒家庭日',
  LOCATION: '綠世界生態農場',
  MAX_COMPANIONS: 20, // 報到頁同行人數選單上限（含本人）
  MAX_REWARD_CLAIMS: 3, // 一個工號最多領取幾份獎品
  DEFAULT_PLAYER_NAME: "夥伴", // 無姓名時的預設稱呼
  COPYRIGHT: '© 2026 AmTRAN Technology Co., Ltd.',
};

/** 闖關禮可領取次數上限（完成頁／領取成功頁與後端 dashboard 預設對齊） */
export const FINISH_REWARD_SLOTS = APP_CONFIG.MAX_REWARD_CLAIMS;

export const GAME_CONFIG = {
  MIN_STAGE: 1,
  TOTAL_STAGES: 6,
};

export const STORAGE_KEYS = {
  stage: "fdgw_stage",
  /** JSON number[]：已答對的站點 id（1–6），任意順序通關 */
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
