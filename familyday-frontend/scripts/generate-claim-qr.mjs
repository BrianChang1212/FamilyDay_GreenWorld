/**
 * 領獎驗證 QR PNG（工作人員手持，掃了才能領一次闖關禮）。
 * 內容為固定字串 `fdgw-claim-token`；驗章邏輯見
 * `src/lib/claimPayload.ts`，FinishView 在 scanning 階段比對 payload。
 *
 * Usage:
 *   npm run qr:claim
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "qr-staff-stations");

const TOKEN = "fdgw-claim-token";

async function main() {
	await fs.promises.mkdir(outDir, { recursive: true });

	const filePath = path.join(outDir, "claim-token.png");
	await QRCode.toFile(filePath, TOKEN, {
		width: 512,
		margin: 2,
		color: { dark: "#0f1f2e", light: "#ffffff" },
		errorCorrectionLevel: "M",
		type: "png",
	});

	console.log("Wrote", path.relative(root, filePath));
	console.log("Payload:", TOKEN);
}

await main();
