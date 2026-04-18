/** 讀取 Vite 環境變數中的 API 根路徑（無尾隨斜線）；未設定或非字串則回傳空字串 */
export function getViteApiBase(): string {
	const raw = import.meta.env.VITE_API_BASE;
	return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}
