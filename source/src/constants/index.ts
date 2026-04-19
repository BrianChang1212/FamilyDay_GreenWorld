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
  name: "fdgw_name",
  employeeId: "fdgw_employeeId",
  inZone: "fdgw_inZone",
  finishClaimed: "fdgw_finishClaimed",
  companionCount: "fdgw_companionCount",
  checkinDone: "fdgw_checkin_done",
  entryIntent: "fdgw_entry_intent",
} as const;
