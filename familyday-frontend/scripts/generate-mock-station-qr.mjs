/**
 * Writes six PNG QR images for local mock API tokens (see mock/server.js challengeIdByStageToken).
 * Usage: npm run qr:mock-stations
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "qr-mock-stations");

await fs.promises.mkdir(outDir, { recursive: true });

const width = 512;
const margin = 2;

for (let i = 1; i <= 6; i++) {
	const text = `stage-${i}-token`;
	const filePath = path.join(outDir, `${text}.png`);
	await QRCode.toFile(filePath, text, {
		width,
		margin,
		color: { dark: "#0f1f2e", light: "#ffffff" },
		errorCorrectionLevel: "M",
		type: "png",
	});
	console.log("Wrote", path.relative(root, filePath), "->", JSON.stringify(text));
}

console.log(`Done. Files in ${path.relative(process.cwd(), outDir) || "."}/`);
