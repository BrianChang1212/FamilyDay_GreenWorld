import fs from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

type FdgwJson = {
	firebaseProjectId?: string;
	functionsRegion?: string;
	functionsEmulatorHost?: string;
	functionsEmulatorPort?: number;
	frontend?: { viteDevPort?: number };
};

/** Repo root `fdgw.project.json` — keep in sync with `.firebaserc` default. */
function loadFdgwForVite(): FdgwJson {
	try {
		const p = fileURLToPath(new URL("../fdgw.project.json", import.meta.url));
		return JSON.parse(fs.readFileSync(p, "utf8")) as FdgwJson;
	} catch {
		return {};
	}
}

const fdgwVite = loadFdgwForVite();

const fgwEmulatorProject =
	process.env.VITE_FGW_EMULATOR_PROJECT ||
	process.env.FGW_EMULATOR_PROJECT ||
	fdgwVite.firebaseProjectId ||
	"rare-lattice-495009-i9";

const fgwRegion = fdgwVite.functionsRegion || "us-central1";
const emuHost = fdgwVite.functionsEmulatorHost || "127.0.0.1";
const emuPort = fdgwVite.functionsEmulatorPort ?? 5003;
const viteDevPort = fdgwVite.frontend?.viteDevPort ?? 5173;

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
	/** 允許從 src 匯入倉庫根的 fdgw.project.json */
	server: {
		fs: { allow: [repoRoot] },
		port: viteDevPort,
		/** 本機開發：讓瀏覽器與 API 同源，session cookie 才能隨 POST 送出 */
		proxy: {
			"/fdgw-emulator-api": {
				target: `http://${emuHost}:${emuPort}`,
				changeOrigin: true,
				rewrite: (path) =>
					path.replace(
						/^\/fdgw-emulator-api/,
						`/${fgwEmulatorProject}/${fgwRegion}/api`,
					),
			},
		},
	},
});
