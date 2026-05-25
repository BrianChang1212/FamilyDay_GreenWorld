/**
 * Upsert N roster documents in Firestore (collection "roster").
 * Default numeric mode: distinct English first names per row (first row Bob for 1141043 / verify script).
 * Given names slot 95+ come from sibling file seed-roster-extra-first-names.json (94 + 406 = 500, matches max seed count cap).
 *
 * Env (credentials · pick one):
 *   GOOGLE_APPLICATION_CREDENTIALS — service account JSON path (recommended)
 *   Or omit and use Application Default Credentials (e.g. gcloud ADC)
 *
 * Env (optional):
 *   SEED_COUNT — default 10
 *   SEED_EMPLOYEE_ID_START — default "1141043"
 *   SEED_NAME_SLOT_ANCHOR — optional; numeric employeeId that maps to name slot 0 (default:
 *       fdgw.project.json seed.defaultEmployeeIdStart). Keeps English names stable by **employee number** so
 *       split runs (e.g. 1141043–52 then 1141053+) do not reuse "Bob" etc.
 *   FDGW_EVENT_ID — overrides event id (default: fdgw.project.json)
 *   Defaults for count / party size / employee start: fdgw.project.json seed.*
 *   FDGW_FIRESTORE_DATABASE_ID — default "default"
 *   SEED_ID_PREFIX — if set (non-empty), legacy mode: PREFIX0001.. + SeedTester0001..
 *
 * Note: Admin SDK targets the GCP project embedded in the service account JSON (project_id field).
 */

import process from "node:process";
import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getEventId, getFirebaseProjectId, loadFdgwProject } from "./read-fdgw-project.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Distinct English given names; concatenated with seed-roster-extra-first-names.json up to max seed count. */
const ENGLISH_FIRST_NAMES = [
	"Bob",
	"Alice",
	"Carol",
	"David",
	"Emma",
	"Frank",
	"Grace",
	"Henry",
	"Ivy",
	"Jack",
	"Kate",
	"Leo",
	"Mia",
	"Noah",
	"Olivia",
	"Paul",
	"Quinn",
	"Rose",
	"Sam",
	"Tina",
	"Uma",
	"Vince",
	"Wendy",
	"Xavier",
	"Yara",
	"Zack",
	"Aaron",
	"Bella",
	"Chris",
	"Diana",
	"Ethan",
	"Fiona",
	"Gavin",
	"Holly",
	"Ian",
	"Julia",
	"Kevin",
	"Luna",
	"Marcus",
	"Nina",
	"Oscar",
	"Paula",
	"Ryan",
	"Sara",
	"Tom",
	"Vera",
	"Will",
	"Zoe",
	"Adam",
	"Beth",
	"Caleb",
	"Derek",
	"Elena",
	"Felix",
	"Gina",
	"Hugo",
	"Ines",
	"Jake",
	"Kara",
	"Liam",
	"Maya",
	"Nate",
	"Opal",
	"Pete",
	"Rita",
	"Sean",
	"Tara",
	"Ulrich",
	"Violet",
	"Wade",
	"Yvonne",
	"Zane",
	"Amy",
	"Blake",
	"Chloe",
	"Dean",
	"Eva",
	"Finn",
	"Gloria",
	"Hank",
	"Iris",
	"James",
	"Kelly",
	"Lisa",
	"Matt",
	"Nora",
	"Owen",
	"Pam",
	"Rick",
	"Sue",
	"Todd",
	"Ursula",
	"Vivian",
	"Walt",
];

const EXTRA_FIRST_NAMES_PATH = join(__dirname, "seed-roster-extra-first-names.json");
const ENGLISH_FIRST_NAMES_EXTRA = JSON.parse(
	fs.readFileSync(EXTRA_FIRST_NAMES_PATH, "utf8"),
);
const ALL_ENGLISH_FIRST_NAMES = ENGLISH_FIRST_NAMES.concat(ENGLISH_FIRST_NAMES_EXTRA);

function assertCred() {
	const p = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
	if (p && !fs.existsSync(p)) {
		throw new Error(`Credential file not found: ${p}`);
	}
}

function initDb() {
	const projectId = getFirebaseProjectId();
	if (getApps().length === 0) {
		initializeApp({
			credential: applicationDefault(),
			projectId,
		});
	}
	const raw = (process.env.FDGW_FIRESTORE_DATABASE_ID || "").trim();
	const dbId = !raw || raw === "default" || raw === "(default)" ? null : raw;
	return dbId ? getFirestore(dbId) : getFirestore();
}

function rosterDocId(eventId, employeeId) {
	return `${eventId}_${employeeId}`;
}

function englishNameAt(slotIndex) {
	if (slotIndex < ALL_ENGLISH_FIRST_NAMES.length) {
		return ALL_ENGLISH_FIRST_NAMES[slotIndex];
	}
	return `RosterSeed${String(slotIndex + 1).padStart(4, "0")}`;
}

async function run() {
	assertCred();
	const seedCfg = loadFdgwProject().seed;
	const count = Math.min(
		Number(seedCfg.maxCount ?? 500),
		Math.max(
			1,
			parseInt(process.env.SEED_COUNT || String(seedCfg.defaultCount ?? 10), 10) ||
				seedCfg.defaultCount ||
				10,
		),
	);
	const eventId = getEventId();
	const partyPlanned = Number(seedCfg.defaultPartySizePlanned ?? 2);
	const legacyPrefix = (process.env.SEED_ID_PREFIX || "").trim();
	const db = initDb();
	const batch = db.batch();
	const now = new Date().toISOString();
	const written = [];
	const usedNames = new Set();

	if (legacyPrefix) {
		for (let i = 1; i <= count; i += 1) {
			const n = String(i).padStart(4, "0");
			const employeeId = `${legacyPrefix}${n}`;
			const name = `SeedTester${n}`;
			const ref = db.collection("roster").doc(rosterDocId(eventId, employeeId));
			batch.set(
				ref,
				{
					eventId,
					employeeId,
					name,
					partySizePlanned: partyPlanned,
					source: "manual",
					updatedAt: now,
				},
				{ merge: true },
			);
			written.push({ employeeId, name });
			usedNames.add(name);
		}
	} else {
		const startRaw = (
			process.env.SEED_EMPLOYEE_ID_START ||
			String(seedCfg.defaultEmployeeIdStart ?? "1141043")
		).trim();
		const startNum = parseInt(startRaw, 10);
		if (!Number.isFinite(startNum) || startNum < 0) {
			throw new Error(`Invalid SEED_EMPLOYEE_ID_START: ${startRaw}`);
		}
		const anchorRaw = (
			process.env.SEED_NAME_SLOT_ANCHOR ||
			String(seedCfg.defaultEmployeeIdStart ?? "1141043")
		).trim();
		const anchorNum = parseInt(anchorRaw, 10);
		if (!Number.isFinite(anchorNum)) {
			throw new Error(`Invalid SEED_NAME_SLOT_ANCHOR: ${anchorRaw}`);
		}
		for (let i = 0; i < count; i += 1) {
			const employeeId = String(startNum + i);
			const nameSlotIndex = startNum + i - anchorNum;
			if (nameSlotIndex < 0) {
				throw new Error(
					`employeeId ${employeeId} is below SEED_NAME_SLOT_ANCHOR (${anchorRaw}); ` +
						`raise anchor or use higher SEED_EMPLOYEE_ID_START`,
				);
			}
			let name = englishNameAt(nameSlotIndex);
			if (usedNames.has(name)) {
				name = `${name}_${employeeId}`;
			}
			usedNames.add(name);
			const ref = db.collection("roster").doc(rosterDocId(eventId, employeeId));
			batch.set(
				ref,
				{
					eventId,
					employeeId,
					name,
					partySizePlanned: partyPlanned,
					source: "manual",
					updatedAt: now,
				},
				{ merge: true },
			);
			written.push({ employeeId, name });
		}
	}

	await batch.commit();
	const mode = legacyPrefix ? `legacy prefix=${legacyPrefix}` : `numeric from ${written[0]?.employeeId}`;
	console.log(`PASS seed-roster: wrote ${written.length} roster rows for eventId=${eventId} (${mode})`);
	for (const row of written) {
		console.log(`  ${row.employeeId} / ${row.name}`);
	}
}

run().catch((err) => {
	console.error(`FAIL seed-roster: ${err.message}`);
	process.exit(1);
});
