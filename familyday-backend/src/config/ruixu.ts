/**
 * 瑞旭通（Ruixu，子公司）員工編號清單。
 *
 * 每日匯出（dumpCheckinsDaily）依此清單把瑞旭通的報到／闖關紀錄「互斥拆分」成
 * 獨立附件：主檔（報到紀錄表／闖關遊戲紀錄表）排除瑞旭通，瑞旭通另出專屬兩份。
 *
 * 採固定清單而非格式判斷，因為 `1003003`（吳旭祐）為 7 碼，與 AMTran 員編格式
 * 相同、無法以位數區分；其餘 11 筆為 6 碼 `300xxx`。
 *
 * 維護：未來瑞旭通名單增減時，更新此清單後重新部署 functions:dumpCheckinsDaily。
 * 來源紀錄見 ref_no_push/firestore-dumps/roster-ruixu-12-20260610-import.json。
 */
export const RUIXU_EMPLOYEE_IDS: ReadonlySet<string> = new Set([
	"300012",
	"300023",
	"300025",
	"300031",
	"300039",
	"300163",
	"300172",
	"300181",
	"300209",
	"300210",
	"300323",
	"1003003",
]);

/** 員編是否屬於瑞旭通（容錯：非字串／空值一律視為非瑞旭通） */
export function isRuixuEmployee(employeeId: unknown): boolean {
	if (employeeId === null || employeeId === undefined) return false;
	return RUIXU_EMPLOYEE_IDS.has(String(employeeId));
}
