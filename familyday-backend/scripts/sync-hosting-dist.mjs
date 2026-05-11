/**
 * Copies familyday-frontend/dist -> familyday-backend/hosting-dist
 * so Firebase Hosting `public` stays inside the backend project folder (CLI restriction).
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendDist = path.resolve(backendRoot, "..", "familyday-frontend", "dist");
const dest = path.join(backendRoot, "hosting-dist");

if (!fs.existsSync(frontendDist)) {
	console.error(`sync-hosting-dist: missing ${frontendDist} — run: cd ../familyday-frontend && npm run build`);
	process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(frontendDist, dest, { recursive: true });
console.log(`sync-hosting-dist: ${frontendDist} -> ${dest}`);
