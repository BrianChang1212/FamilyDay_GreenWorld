/**
 * Preview the daily dump CSV output — reads live Firestore, prints first N rows
 * of each CSV to console. No email is sent.
 *
 * Prerequisites:
 *   npm run build                              (compile TS → lib/ first)
 *   GOOGLE_APPLICATION_CREDENTIALS=<SA JSON>
 *   FDGW_FIREBASE_PROJECT_ID=familyday-greenworld
 *
 * Usage:
 *   node scripts/preview-dump-csv.mjs          (default: first 20 rows)
 *   node scripts/preview-dump-csv.mjs --rows=5
 */

import { createRequire } from "node:module";
import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseProjectId } from "./read-fdgw-project.mjs";

const require = createRequire(import.meta.url);
const { buildDailyDumpReport } = require("../lib/scheduled/dumpReport.js");

const EVENT_ID = "familyday-2026";

const maxRows = (() => {
	const arg = process.argv.find((a) => a.startsWith("--rows="));
	return arg ? parseInt(arg.split("=")[1], 10) : 20;
})();

function initDb() {
	const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
	if (cred && !fs.existsSync(cred)) {
		throw new Error(`Credential file not found: ${cred}`);
	}
	const projectId = getFirebaseProjectId();
	if (getApps().length === 0) {
		initializeApp({ credential: applicationDefault(), projectId });
	}
	return getFirestore();
}

function printCsvPreview(label, csv) {
	const lines = csv.split("\r\n");
	const total = lines.length - 1; // exclude header
	console.log(`\n=== ${label} (${total} 筆，顯示前 ${Math.min(maxRows, total)} 筆) ===`);
	lines.slice(0, maxRows + 1).forEach((line, i) => {
		const prefix = i === 0 ? "[header]" : `[${String(i).padStart(4, " ")}]`;
		console.log(`${prefix}  ${line}`);
	});
	if (total > maxRows) {
		console.log(`       ... 省略 ${total - maxRows} 筆`);
	}
}

async function run() {
	const db = initDb();
	const projectId = getFirebaseProjectId();
	console.log(`Project: ${projectId}  |  max-rows: ${maxRows}`);

	const [checkinSnap, progressSnap, rosterSnap] = await Promise.all([
		db.collection("checkins").get(),
		db.collection("player_progress").get(),
		db.collection("roster").where("eventId", "==", EVENT_ID).get(),
	]);

	const rosterNameMap = new Map();
	for (const doc of rosterSnap.docs) {
		const d = doc.data();
		if (typeof d.employeeId === "string" && d.employeeId) {
			rosterNameMap.set(d.employeeId, typeof d.name === "string" ? d.name : "");
		}
	}

	const dateStr = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Taipei",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());

	const report = buildDailyDumpReport({
		dateStr,
		checkins: checkinSnap.docs.map((d) => d.data()),
		progressDocs: progressSnap.docs.map((d) => ({ employeeId: d.id, ...d.data() })),
		rosterNameMap,
	});

	console.log(`\nSubject: ${report.subject}`);
	console.log(`Counts: 報到 ${report.checkinCount} / 闖關 ${report.progressCount}`);
	console.log(`Roster loaded: ${rosterNameMap.size} 筆`);

	for (const att of report.attachments) {
		printCsvPreview(att.filename, att.csv);
	}

	console.log("\nDONE — 請確認上方兩份 CSV 工號欄位均由小到大排列。");
}

run().catch((err) => {
	console.error(`FAIL preview-dump-csv: ${err.message}`);
	process.exit(1);
});
