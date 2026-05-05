const DEV_PROXY_BASE = "/fdgw-emulator-api";

/** 讀取 Vite 環境變數中的 API 根路徑（無尾隨斜線）；未設定或非字串則回傳空字串 */
export function getViteApiBase(): string {
	const raw = import.meta.env.VITE_API_BASE;
	const base =
		typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";

	if (!import.meta.env.DEV || base === "" || typeof window === "undefined") {
		return base;
	}

	try {
		if (base.startsWith("/")) {
			return base;
		}
		const apiUrl = new URL(base);
		const pageHost = window.location.hostname;
		const apiHost = apiUrl.hostname;
		const loopbackMismatch =
			(pageHost === "localhost" && apiHost === "127.0.0.1") ||
			(pageHost === "127.0.0.1" && apiHost === "localhost");
		if (loopbackMismatch) {
			return DEV_PROXY_BASE;
		}
	} catch {
		// invalid absolute URL; fall through
	}

	return base;
}
