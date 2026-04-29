import { getDb, useFirestoreStore } from "../utils/store";

type RedeemTokenRecord = {
	token: string;
	employeeId: string;
	expiresAtMs: number;
};

type RedeemConfirmRecord = {
	redeemId: string;
	employeeId: string;
	staffId: string;
	confirmedAt: string;
};

const tokenStore = new Map<string, RedeemTokenRecord>();
const redeemedByEmployee = new Map<string, RedeemConfirmRecord>();

function randomToken(): string {
	return `redeem_${Math.random().toString(36).slice(2, 12)}`;
}

export async function issueRedeemToken(
	employeeId: string,
	ttlSec = 300,
): Promise<{
	token: string;
	expiresInSec: number;
}> {
	const token = randomToken();
	const expiresAtMs = Date.now() + ttlSec * 1000;
	if (useFirestoreStore()) {
		const db = getDb();
		await db
			.collection("redeem_tokens")
			.doc(token)
			.set({ token, employeeId, expiresAtMs }, { merge: true });
		return { token, expiresInSec: ttlSec };
	}
	tokenStore.set(token, { token, employeeId, expiresAtMs });
	return { token, expiresInSec: ttlSec };
}

export async function confirmRedeem(
	token: string,
	staffId: string,
): Promise<{ ok: true; redeemId: string } | { ok: false; code: string; message: string }> {
	if (useFirestoreStore()) {
		const db = getDb();
		const snap = await db.collection("redeem_tokens").doc(token).get();
		if (!snap.exists) {
			return {
				ok: false,
				code: "INVALID_REDEEM_TOKEN",
				message: "redeem token not found",
			};
		}
		const found = snap.data() as RedeemTokenRecord;
		if (found.expiresAtMs < Date.now()) {
			await db.collection("redeem_tokens").doc(token).delete();
			return {
				ok: false,
				code: "EXPIRED_REDEEM_TOKEN",
				message: "redeem token expired",
			};
		}

		const existed = await db.collection("redeem_records").doc(found.employeeId).get();
		if (existed.exists) {
			return {
				ok: false,
				code: "ALREADY_REDEEMED",
				message: "reward already redeemed",
			};
		}
		const redeemId = `redeem_${found.employeeId}_${Date.now()}`;
		await db.collection("redeem_records").doc(found.employeeId).set({
			redeemId,
			employeeId: found.employeeId,
			staffId,
			confirmedAt: new Date().toISOString(),
		});
		await db.collection("redeem_tokens").doc(token).delete();
		return { ok: true, redeemId };
	}

	const found = tokenStore.get(token);
	if (!found) {
		return { ok: false, code: "INVALID_REDEEM_TOKEN", message: "redeem token not found" };
	}
	if (found.expiresAtMs < Date.now()) {
		tokenStore.delete(token);
		return { ok: false, code: "EXPIRED_REDEEM_TOKEN", message: "redeem token expired" };
	}
	if (redeemedByEmployee.has(found.employeeId)) {
		return { ok: false, code: "ALREADY_REDEEMED", message: "reward already redeemed" };
	}

	const redeemId = `redeem_${found.employeeId}_${Date.now()}`;
	redeemedByEmployee.set(found.employeeId, {
		redeemId,
		employeeId: found.employeeId,
		staffId,
		confirmedAt: new Date().toISOString(),
	});
	tokenStore.delete(token);
	return { ok: true, redeemId };
}

export async function getRedeemSummary(): Promise<{ totalRedeemed: number }> {
	if (useFirestoreStore()) {
		const db = getDb();
		const v = await db.collection("redeem_records").count().get();
		return { totalRedeemed: v.data().count };
	}
	return { totalRedeemed: redeemedByEmployee.size };
}
