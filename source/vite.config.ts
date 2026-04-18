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
});
