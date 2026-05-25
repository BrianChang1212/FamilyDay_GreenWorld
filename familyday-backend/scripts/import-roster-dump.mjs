/**
 * Restore roster collection from a firestore-dumps JSON file.
 *
 * Usage:
 *   set GOOGLE_APPLICATION_CREDENTIALS=<sa.json>
 *   node ./scripts/import-roster-dump.mjs <path-to-dump.json>
 *
 * Env:
 *   FDGW_FIRESTORE_DATABASE_ID — default "default"
 *   FDGW_EXPECT_PROJECT_ID — if set, must match dump.projectId
 */

import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseProjectId } from "./read-fdgw-project.mjs";

const BATCH_LIMIT = 500;

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

function loadDump(dumpPath) {
	const raw = fs.readFileSync(dumpPath, "utf8");
	const dump = JSON.parse(raw);
	if (!dump || dump.collection !== "roster" || !Array.isArray(dump.docs)) {
		throw new Error("Invalid dump: expected collection=roster and docs[]");
	}
	return dump;
}

async function commitBatches(db, ops) {
	for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
		const chunk = ops.slice(i, i + BATCH_LIMIT);
		const batch = db.batch();
		for (const op of chunk) {
			batch.set(op.ref, op.data, { merge: true });
		}
		await batch.commit();
	}
}

async function run() {
	const dumpPath = process.argv[2];
	if (!dumpPath) {
		throw new Error("Usage: node ./scripts/import-roster-dump.mjs <dump.json>");
	}
	if (!fs.existsSync(dumpPath)) {
		throw new Error(`Dump file not found: ${dumpPath}`);
	}

	assertCred();
	const dump = loadDump(dumpPath);
	const expect = (process.env.FDGW_EXPECT_PROJECT_ID || "").trim();
	if (expect && dump.projectId && expect !== dump.projectId) {
		throw new Error(
			`Project mismatch: dump.projectId=${dump.projectId}, FDGW_EXPECT_PROJECT_ID=${expect}`,
		);
	}

	const db = initDb();
	const ops = [];
	for (const doc of dump.docs) {
		const id = String(doc.id || "").trim();
		const employeeId = String(doc.employeeId || "").trim();
		const name = String(doc.name || "").trim();
		const eventId = String(doc.eventId || "").trim();
		if (!id || !employeeId || !name || !eventId) {
			continue;
		}
		const data = {
			eventId,
			employeeId,
			name,
			source: doc.source === "import" ? "import" : "manual",
			updatedAt: doc.updatedAt || new Date().toISOString(),
		};
		if (doc.partySizePlanned != null) {
			data.partySizePlanned = doc.partySizePlanned;
		}
		ops.push({
			ref: db.collection("roster").doc(id),
			data,
		});
	}
	if (ops.length === 0) {
		throw new Error("No valid roster documents in dump.");
	}

	await commitBatches(db, ops);
	console.log(
		`PASS import-roster-dump: wrote ${ops.length} docs to roster (dump count=${dump.count}, projectId=${dump.projectId})`,
	);
}

run().catch((err) => {
	console.error(`FAIL import-roster-dump: ${err.message}`);
	process.exit(1);
});
