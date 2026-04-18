import { getViteApiBase } from "@/lib/apiBase";
import { incrementFinishClaimed } from "@/lib/demoState";

/**
 * 完成頁確認領獎後：若未設定 API 根網址，則遞增本機原型計數。
 * 上線後應改為後端核銷成功再導頁；此函式不觸及 Vue。
 */
export function incrementLocalFinishClaimIfNoApiBase(): void {
	if (!getViteApiBase()) {
		incrementFinishClaimed();
	}
}
