/**
 * Print Firestore aggregate count for collection "checkins" (reads live DB via Admin SDK).
 *
 * Prerequisites:
 *   GOOGLE_APPLICATION_CREDENTIALS — service account JSON path, or Application Default Credentials
 *
 * Env (optional):
 *   FDGW_FIRESTORE_DATABASE_ID — default "default"
 *   FDGW_FIREBASE_PROJECT_ID etc. — see read-fdgw-project.mjs
 */

import process from "node:process";
import fs from "node:fs";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseProjectId } from "./read-fdgw-project.mjs";

function assertCredPathIfSet() {
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

async function run() {
	assertCredPathIfSet();
	const db = initDb();
	const snap = await db.collection("checkins").count().get();
	const count = snap.data().count;
	const out = {
		collection: "checkins",
		count,
		databaseId: process.env.FDGW_FIRESTORE_DATABASE_ID || "default",
		projectId: getFirebaseProjectId(),
	};
	console.log(JSON.stringify(out, null, 2));
}

run().catch((err) => {
	console.error(`FAIL count-checkins: ${err.message}`);
	process.exit(1);
});
