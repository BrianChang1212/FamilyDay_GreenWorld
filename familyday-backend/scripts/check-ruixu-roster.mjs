/**
 * READ-ONLY: check the 瑞旭通 (Ruixu) roster list against the existing
 * production roster for collisions, before any import.
 *
 * Usage (PowerShell):
 *   $env:GOOGLE_APPLICATION_CREDENTIALS=".secrets\familyday-greenworld-d90c35ca2fdd.json"
 *   $env:FDGW_FIREBASE_PROJECT_ID="familyday-greenworld"
 *   $env:GOOGLE_CLOUD_PROJECT="familyday-greenworld"
 *   node ./scripts/check-ruixu-roster.mjs <path-to-ruixu_roster.json>
 *
 * Does NOT write anything.
 */
import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const EVENT_ID = process.env.FDGW_EVENT_ID || "familyday-2026";

function rosterDocId(eventId, employeeId) {
	return `${eventId}_${employeeId}`;
}

function initDb() {
	const projectId =
		process.env.FDGW_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
	if (getApps().length === 0) {
		initializeApp({ credential: applicationDefault(), projectId });
	}
	const raw = (process.env.FDGW_FIRESTORE_DATABASE_ID || "").trim();
	const dbId = !raw || raw === "default" || raw === "(default)" ? null : raw;
	return dbId ? getFirestore(dbId) : getFirestore();
}

async function run() {
	const listPath = process.argv[2];
	if (!listPath || !fs.existsSync(listPath)) {
		throw new Error("Usage: node check-ruixu-roster.mjs <ruixu_roster.json>");
	}
	const incoming = JSON.parse(fs.readFileSync(listPath, "utf8")).map((r) => ({
		employeeId: String(r.employeeId).trim(),
		name: String(r.name).trim(),
	}));

	// 1) internal duplicates within the incoming list
	const seen = new Map();
	const internalDup = [];
	for (const r of incoming) {
		if (seen.has(r.employeeId)) internalDup.push(r);
		else seen.set(r.employeeId, r);
	}

	const db = initDb();

	// 2) total existing roster for this event
	const existingSnap = await db
		.collection("roster")
		.where("eventId", "==", EVENT_ID)
		.get();
	console.log(`eventId=${EVENT_ID}  existing roster docs=${existingSnap.size}`);

	// 3) per-id collision check (doc id = eventId_employeeId)
	const collisions = [];
	for (const r of incoming) {
		const ref = db.collection("roster").doc(rosterDocId(EVENT_ID, r.employeeId));
		const snap = await ref.get();
		if (snap.exists) {
			const ex = snap.data();
			collisions.push({
				employeeId: r.employeeId,
				incomingName: r.name,
				existingName: ex.name,
				sameName: ex.name === r.name,
			});
		}
	}

	console.log("\n=== 瑞旭通 incoming list (12) ===");
	for (const r of incoming) console.log(`  ${r.employeeId}  ${r.name}`);

	console.log(`\n=== internal duplicates: ${internalDup.length} ===`);
	for (const r of internalDup) console.log(`  DUP ${r.employeeId} ${r.name}`);

	console.log(`\n=== collisions with existing roster: ${collisions.length} ===`);
	for (const c of collisions) {
		console.log(
			`  COLLIDE ${c.employeeId}: incoming="${c.incomingName}" vs existing="${c.existingName}" ${c.sameName ? "(SAME name)" : "(DIFFERENT name!)"}`,
		);
	}

	console.log(
		`\nSUMMARY: incoming=${incoming.length}, internalDup=${internalDup.length}, collisions=${collisions.length}, net-new=${incoming.length - internalDup.length - collisions.length}`,
	);
}

run().catch((e) => {
	console.error("FAIL:", e.message);
	process.exit(1);
});
