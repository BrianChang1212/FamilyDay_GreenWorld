/**
 * Encode six staging/production QR payloads (e.g. JWTs) into PNGs.
 * Do not commit real JWTs — use staging-qr-payloads.local.txt (gitignored).
 *
 * Usage:
 *   npm run qr:staging-stations
 *   STAGING_QR_PAYLOADS_FILE=./my-payloads.txt npm run qr:staging-stations
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
		const text = payloads[i];
		const filePath = path.join(outDir, `station-${i + 1}.png`);
		await QRCode.toFile(filePath, text, {
			width,
			margin,
			color: { dark: "#0f1f2e", light: "#ffffff" },
			errorCorrectionLevel: "M",
			type: "png",
		});
		console.log(
			"Wrote",
			path.relative(root, filePath),
			"chars:",
			String(text.length),
		);
	}

	console.log(`Done. Output: ${path.relative(process.cwd(), outDir)}/`);
}

await main();
