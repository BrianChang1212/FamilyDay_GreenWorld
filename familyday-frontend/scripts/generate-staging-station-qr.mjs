/**
 * Encode six staging/production QR payloads (e.g. JWTs) into PNGs.
 * Do not commit real JWTs — use staging-qr-payloads.local.txt (gitignored).
 *
 * 每張 PNG 編碼為 deep-link URL，例：
 *   https://rare-lattice-495009-i9.web.app/scan?t=<JWT>
 *
 * 這樣手機內建相機 / 任何 QR scanner 都能透過此 URL 進入活動 App（路由 `/scan`）。
 * 內嵌 scanner 同樣可解碼 URL（見 `src/lib/qrPayload.ts`）。
 *
 * Usage:
 *   npm run qr:staging-stations
 *   STAGING_QR_PAYLOADS_FILE=./my-payloads.txt npm run qr:staging-stations
 *   STAGING_QR_HOST=https://example.com npm run qr:staging-stations
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultPayloadFile = path.join(root, "staging-qr-payloads.local.txt");
const payloadFile =
	process.env.STAGING_QR_PAYLOADS_FILE || defaultPayloadFile;
const outDir = path.join(root, "public", "qr-staging-stations");
const SCAN_HOST = (
	process.env.STAGING_QR_HOST || "https://rare-lattice-495009-i9.web.app"
).replace(/\/+$/, "");

function readPayloads(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");
	return raw
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0 && !l.startsWith("#"));
}

async function main() {
	if (!fs.existsSync(payloadFile)) {
		console.error(
			"Missing payload file. Copy staging-qr-payloads.example.txt to staging-qr-payloads.local.txt and paste six payloads (one per line), or set STAGING_QR_PAYLOADS_FILE.",
		);
		console.error("Expected:", payloadFile);
		process.exit(1);
	}

	const payloads = readPayloads(payloadFile);
	if (payloads.length !== 6) {
		console.error(
			`Expected exactly 6 non-empty payload lines, got ${payloads.length}.`,
		);
		process.exit(1);
	}

	await fs.promises.mkdir(outDir, { recursive: true });

	const width = 512;
	const margin = 2;

	for (let i = 0; i < 6; i++) {
		const payload = payloads[i];
		const url = `${SCAN_HOST}/scan?t=${encodeURIComponent(payload)}`;
		const filePath = path.join(outDir, `station-${i + 1}.png`);
		await QRCode.toFile(filePath, url, {
			width,
			margin,
			color: { dark: "#0f1f2e", light: "#ffffff" },
			errorCorrectionLevel: "M",
			type: "png",
		});
		console.log(
			"Wrote",
			path.relative(root, filePath),
			"url chars:",
			String(url.length),
		);
	}

	console.log(`Done. Output: ${path.relative(process.cwd(), outDir)}/`);
}

await main();
