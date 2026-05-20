/**
 * PNG QR codes for hosted entry URLs (報到 / 闖關 / 領獎).
 *
 * Payloads match router redirects:
 *   /check-in → check-in welcome + session intent
 *   /game     → game welcome + session intent
 *   /reward   → finish view (or register if not logged in, with pendingFinish)
 *
 * Usage:
 *   npm run qr:entry-links
 *   FDGW_HOSTING_BASE=https://your-host.web.app npm run qr:entry-links
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const projectJsonPath = path.join(root, "fdgw.project.json");

function defaultHostingBase() {
	let base = "https://rare-lattice-495009-i9.web.app";
	try {
		const raw = fs.readFileSync(projectJsonPath, "utf8");
		const id = JSON.parse(raw).firebaseProjectId;
		if (typeof id === "string" && id.length > 0) {
			base = `https://${id}.web.app`;
		}
	} catch {
		/* keep fallback */
	}
	return base;
}

const baseRaw = process.env.FDGW_HOSTING_BASE || defaultHostingBase();
const base = baseRaw.replace(/\/$/, "");

const pairs = [
	{ name: "entry-check-in", path: "/check-in", label: "報到入口" },
	{ name: "entry-game", path: "/game", label: "闖關入口" },
	{ name: "entry-reward", path: "/reward", label: "領獎入口" },
];

const outDir = path.join(root, "public", "qr-entry-links");

async function main() {
	await fs.promises.mkdir(outDir, { recursive: true });

	const width = 512;
	const margin = 2;

	for (const { name, path: p, label } of pairs) {
		const url = `${base}${p}`;
		const filePath = path.join(outDir, `${name}.png`);
		await QRCode.toFile(filePath, url, {
			width,
			margin,
			color: { dark: "#0f1f2e", light: "#ffffff" },
			errorCorrectionLevel: "M",
			type: "png",
		});
		console.log(`${label}: ${url}`);
		console.log("  →", path.relative(root, filePath));
	}

	console.log(`\nDone. Base: ${base}`);
}

await main();
