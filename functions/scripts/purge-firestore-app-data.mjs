/**
 * Delete all documents in configured app collections (dev reset).
 *
 * REQUIRED env:
 *   GOOGLE_APPLICATION_CREDENTIALS — service account JSON path
 *   FDGW_PURGE_CONFIRM — must be exactly "YES"
 *   FDGW_EXPECT_PROJECT_ID — must equal the "project_id" inside that JSON (safety interlock)
 *
 * OPTIONAL:
 *   FDGW_FIRESTORE_DATABASE_ID — default "default"
 *   FDGW_PURGE_COLLECTIONS — comma-separated, default:
 *     roster,checkins,player_progress,redeem_tokens,redeem_records
 *
 * Order: redeem_tokens → redeem_records → player_progress → checkins → roster
 * (rough dependency order; Firestore has no FKs but tokens first is sensible)
 */

import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { FieldPath, getFirestore } from "firebase-admin/firestore";

const DEFAULT_COLLECTIONS = [
	"redeem_tokens",
	"redeem_records",
	"player_progress",
	"checkins",
	"roster",
];

function readProjectIdFromCredentials() {
	const p = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
	if (!p || !fs.existsSync(p)) {
		throw new Error("GOOGLE_APPLICATION_CREDENTIALS must point to an existing JSON file.");
	}
	const raw = fs.readFileSync(p, "utf8");
	const j = JSON.parse(raw);
	if (!j.project_id || typeof j.project_id !== "string") {
		throw new Error("Credential JSON missing string project_id.");
	}
	return j.project_id;
}

function assertConfirm() {
	if (process.env.FDGW_PURGE_CONFIRM !== "YES") {
		throw new Error(
			'Set FDGW_PURGE_CONFIRM=YES to run purge (destructive). Also set FDGW_EXPECT_PROJECT_ID to your credential project_id.',
		);
	}
	const expected = (process.env.FDGW_EXPECT_PROJECT_ID || "").trim();
	if (!expected) {
		throw new Error("FDGW_EXPECT_PROJECT_ID is required (must match service account project_id).");
	}
	const actual = readProjectIdFromCredentials();
	if (actual !== expected) {
		throw new Error(
			`FDGW_EXPECT_PROJECT_ID mismatch: env="${expected}" but credential project_id="${actual}". Refusing to purge.`,
		);
	}
}

function initDb() {
	if (getApps().length === 0) {
		initializeApp({ credential: applicationDefault() });
	}
	return getFirestore(process.env.FDGW_FIRESTORE_DATABASE_ID || "default");
}

async function deleteCollection(db, collectionId) {
	const ref = db.collection(collectionId);
	const batchSize = 400;
	let total = 0;
	for (;;) {
		const snap = await ref.orderBy(FieldPath.documentId()).limit(batchSize).get();
		if (snap.empty) {
			break;
		}
		const batch = db.batch();
		for (const doc of snap.docs) {
			batch.delete(doc.ref);
		}
		await batch.commit();
		total += snap.size;
	}
	return total;
}

async function run() {
	assertConfirm();
	const db = initDb();
	const raw = (process.env.FDGW_PURGE_COLLECTIONS || "").trim();
	const ids = raw
		? raw.split(",").map((s) => s.trim()).filter(Boolean)
		: DEFAULT_COLLECTIONS;
	const projectId = readProjectIdFromCredentials();

	console.log(`Purge target project_id=${projectId} collections=${ids.join(",")}`);

	for (const id of ids) {
		const n = await deleteCollection(db, id);
		console.log(`  deleted ${n} docs from /${id}`);
	}

	console.log("PASS purge-firestore-app-data");
}

run().catch((err) => {
	console.error(`FAIL purge-firestore-app-data: ${err.message}`);
	process.exit(1);
});
