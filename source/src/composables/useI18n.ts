import { zhTW } from "@/i18n/zh-TW";
import { APP_CONFIG } from "@/constants";

type RecursiveKeyOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: K extends string | number
        ? `${K}` | `${K}.${RecursiveKeyOf<T[K]>}`
        : never;
    }[keyof T & (string | number)]
  : never;

type I18nKey = RecursiveKeyOf<typeof zhTW>;

/**
 * 簡單的 i18n Composable
 * 用於在不使用第三方庫的情況下統一管理字串
 */
export function useI18n() {
  const messages = zhTW;

  /**
   * 根據 key 取得翻譯字串，並進行簡單的變數替換
   * @param key i18n 的 key (例如: 'welcome.title')
   * @param params 變數替換 (例如: { year: '2026' })
   */
  const t = (key: I18nKey, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value[k] === undefined) {
        console.warn(`I18n key not found: ${key}`);
        return key;
      }
      value = value[k];
    }

    if (typeof value !== 'string') return key;

    // 進行全域常數替換 (例如 {YEAR} / {year})
    let result = value;
    const appConfigAliases = {
      year: APP_CONFIG.YEAR,
      companyName: APP_CONFIG.COMPANY_NAME,
      eventName: APP_CONFIG.EVENT_NAME,
      location: APP_CONFIG.LOCATION,
      maxCompanions: APP_CONFIG.MAX_COMPANIONS,
      maxRewardClaims: APP_CONFIG.MAX_REWARD_CLAIMS,
      copyright: APP_CONFIG.COPYRIGHT,
      defaultPlayerName: APP_CONFIG.DEFAULT_PLAYER_NAME,
    };
    const allParams = { ...APP_CONFIG, ...appConfigAliases, ...params };

    Object.entries(allParams).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });

    return result;
  };

  return { t };
}
