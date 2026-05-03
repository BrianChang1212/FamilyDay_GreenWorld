/**
 * Upsert N roster documents in Firestore (collection "roster").
 * Default numeric mode: distinct English first names per row (first row Bob for 1141043 / verify script).
 *
 * Env (required):
 *   GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON
 *
 * Env (optional):
 *   SEED_COUNT — default 10
 *   SEED_EMPLOYEE_ID_START — default "1141043"
 *   FDGW_EVENT_ID — default "familyday-2026"
 *   FDGW_FIRESTORE_DATABASE_ID — default "default"
 *   SEED_ID_PREFIX — if set (non-empty), legacy mode: PREFIX0001.. + SeedTester0001..
 *
 * Note: Admin SDK targets the GCP project embedded in the service account JSON (project_id field).
 */

import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/** Distinct English given names; longer than typical SEED_COUNT; no duplicates. */
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

function assertCred() {
	const p = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
	if (!p) {
		throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set.");
	}
	if (!fs.existsSync(p)) {
		throw new Error(`Credential file not found: ${p}`);
	}
}

function initDb() {
	if (getApps().length === 0) {
		initializeApp({ credential: applicationDefault() });
	}
	const id = process.env.FDGW_FIRESTORE_DATABASE_ID || "default";
	return getFirestore(id);
}

function rosterDocId(eventId, employeeId) {
	return `${eventId}_${employeeId}`;
}

function englishNameAt(slotIndex) {
	if (slotIndex < ENGLISH_FIRST_NAMES.length) {
		return ENGLISH_FIRST_NAMES[slotIndex];
	}
	return `RosterSeed${String(slotIndex + 1).padStart(4, "0")}`;
}

async function run() {
	assertCred();
	const count = Math.min(
		500,
		Math.max(1, parseInt(process.env.SEED_COUNT || "10", 10) || 10),
	);
	const eventId = process.env.FDGW_EVENT_ID || "familyday-2026";
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
					partySizePlanned: 2,
					source: "manual",
					updatedAt: now,
				},
				{ merge: true },
			);
			written.push({ employeeId, name });
			usedNames.add(name);
		}
	} else {
		const startRaw = (process.env.SEED_EMPLOYEE_ID_START || "1141043").trim();
		const startNum = parseInt(startRaw, 10);
		if (!Number.isFinite(startNum) || startNum < 0) {
			throw new Error(`Invalid SEED_EMPLOYEE_ID_START: ${startRaw}`);
		}
		for (let i = 0; i < count; i += 1) {
			const employeeId = String(startNum + i);
			let name = englishNameAt(i);
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
					partySizePlanned: 2,
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
