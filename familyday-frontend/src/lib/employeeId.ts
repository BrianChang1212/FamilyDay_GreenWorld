import { EMPLOYEE_ID_LOOKUP_MIN_LEN } from "@/constants";

/**
 * 是否已輸入足夠長度的員工編號，可觸發 roster 姓名查詢（自動帶入）。
 *
 * AMTran 為 7 碼、子公司瑞旭通為 6 碼（300xxx），門檻取兩者最小值
 * （`EMPLOYEE_ID_LOOKUP_MIN_LEN` = 6）。曾因硬編碼 `< 7` 導致 6 碼瑞旭通員編
 * 永不觸發查詢、姓名留空、送出鍵 disabled，登入／報到輸入後「沒有反應」。
 */
export function shouldLookupEmployeeId(employeeId: string): boolean {
	return employeeId.trim().length >= EMPLOYEE_ID_LOOKUP_MIN_LEN;
}
