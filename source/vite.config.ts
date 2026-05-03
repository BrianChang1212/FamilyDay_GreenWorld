import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

/** GitHub Pages 專案站路徑為 /<repo>/；Netlify 等根網域部署勿設此變數 */
function viteBase(): string {
	const raw = process.env.VITE_BASE_PATH;
	if (raw === undefined || raw === "") return "/";
	const trimmed = raw.replace(/\/$/, "");
	return trimmed === "" ? "/" : `${trimmed}/`;
}

export default defineConfig({
	base: viteBase(),
	plugins: [vue()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	/** 本機開發：讓瀏覽器與 API 同源，session cookie 才能隨 POST 送出（避免 localhost:5173 ↔ 127.0.0.1:5003 被視為跨站） */
	server: {
		proxy: {
			"/fdgw-emulator-api": {
				target: "http://127.0.0.1:5003",
				changeOrigin: true,
				rewrite: (path) =>
					path.replace(
						/^\/fdgw-emulator-api/,
						"/familyday-greenworld-dev/us-central1/api",
					),
			},
		},
	},
});
