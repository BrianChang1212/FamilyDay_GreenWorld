/**
 * 領獎驗證 QR token：工作人員手持的 QR PNG 內容。
 * 玩家於 FinishView 按「領取闖關禮」後進入掃 QR 全屏，掃到此 token
 * 才會呼叫 `/api/v1/me/reward/claim`，避免無人監督時連按領滿上限。
 *
 * 安全性說明：使用固定字串足以應付一日活動；後端 `maxRounds=3` 仍為硬上限。
 * 若日後活動規模擴大，可升級為 JWT 簽章並由後端驗證。
 */

export const CLAIM_TOKEN_VALUE = "fdgw-claim-token";

export function isClaimToken(payload: string): boolean {
	return payload.trim() === CLAIM_TOKEN_VALUE;
}
