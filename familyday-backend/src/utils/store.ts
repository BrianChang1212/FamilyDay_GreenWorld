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

function firestoreDatabaseId(): string {
	return process.env.FDGW_FIRESTORE_DATABASE_ID || "default";
}

export function getDb() {
	if (getApps().length === 0) {
		initializeApp({
			credential: applicationDefault(),
		});
	}
	return getFirestore(firestoreDatabaseId());
}
