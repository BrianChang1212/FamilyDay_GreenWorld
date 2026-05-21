import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function toBool(v: string | undefined): boolean {
	if (!v) {
		return false;
	}
	const normalized = v.trim().toLowerCase();
	return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function useFirestoreStore(): boolean {
	return toBool(process.env.FDGW_USE_FIRESTORE);
}

function firestoreDatabaseId(): string | null {
	const raw = (process.env.FDGW_FIRESTORE_DATABASE_ID || "").trim();
	if (!raw || raw === "default" || raw === "(default)") return null;
	return raw;
}

export function getDb() {
	if (getApps().length === 0) {
		initializeApp({
			credential: applicationDefault(),
		});
	}
	const dbId = firestoreDatabaseId();
	return dbId ? getFirestore(dbId) : getFirestore();
}
