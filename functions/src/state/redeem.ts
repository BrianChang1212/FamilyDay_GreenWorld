import { getDb, useFirestoreStore } from "../utils/store";
import { defaultProgress, getOrInitProgress } from "./game";

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

type RedeemFail = { ok: false; code: string; message: string };

const tokenStore = new Map<string, RedeemTokenRecord>();
/** 記憶體模式：每次核銷一筆（文件 ID = redeemId），供報表計數 */
const redeemHistory: RedeemConfirmRecord[] = [];

function randomToken(): string {
	return `redeem_${Math.random().toString(36).slice(2, 12)}`;
}

function throwRedeemFail(f: RedeemFail): never {
	const err = new Error(f.message) as Error & { redeemFail: RedeemFail };
	err.redeemFail = f;
	throw err;
}

function asRedeemFail(err: unknown): RedeemFail | null {
	if (err && typeof err === "object" && "redeemFail" in err) {
		return (err as { redeemFail: RedeemFail }).redeemFail;
	}
	return null;
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
): Promise<{ ok: true; redeemId: string } | RedeemFail> {
	if (useFirestoreStore()) {
		try {
			const redeemId = await confirmRedeemFirestoreTransaction(token, staffId);
			return { ok: true, redeemId };
		} catch (err: unknown) {
			const f = asRedeemFail(err);
			if (f) {
				return f;
			}
			throw err;
		}
	}

	return confirmRedeemMemory(token, staffId);
}

async function confirmRedeemFirestoreTransaction(
	token: string,
	staffId: string,
): Promise<string> {
	const db = getDb();
	const tokenRef = db.collection("redeem_tokens").doc(token);
	return db.runTransaction(async (tx) => {
		const snap = await tx.get(tokenRef);
		if (!snap.exists) {
			throwRedeemFail({
				ok: false,
				code: "INVALID_REDEEM_TOKEN",
				message: "redeem token not found",
			});
		}
		const found = snap.data() as RedeemTokenRecord;
		if (found.expiresAtMs < Date.now()) {
			tx.delete(tokenRef);
			throwRedeemFail({
				ok: false,
				code: "EXPIRED_REDEEM_TOKEN",
				message: "redeem token expired",
			});
		}

		const employeeId = found.employeeId;
		const progRef = db.collection("player_progress").doc(employeeId);
		const progSnap = await tx.get(progRef);
		let rewardRedeemCount = 0;
		let maxRounds = 3;
		if (progSnap.exists) {
			const d = progSnap.data() as Record<string, unknown>;
			rewardRedeemCount = Math.max(0, Math.floor(Number(d.rewardRedeemCount) || 0));
			maxRounds = Math.max(1, Math.floor(Number(d.maxRounds) || 3));
		}
		if (rewardRedeemCount >= maxRounds) {
			throwRedeemFail({
				ok: false,
				code: "REDEEM_LIMIT_REACHED",
				message: "redeem limit reached for this player",
			});
		}

		const redeemId = `redeem_${employeeId}_${Date.now()}`;
		const record: RedeemConfirmRecord = {
			redeemId,
			employeeId,
			staffId,
			confirmedAt: new Date().toISOString(),
		};
		tx.set(db.collection("redeem_records").doc(redeemId), record);
		const next = rewardRedeemCount + 1;
		if (!progSnap.exists) {
			tx.set(progRef, { ...defaultProgress(), rewardRedeemCount: next }, { merge: true });
		} else {
			tx.set(progRef, { rewardRedeemCount: next }, { merge: true });
		}
		tx.delete(tokenRef);
		return redeemId;
	});
}

async function confirmRedeemMemory(
	token: string,
	staffId: string,
): Promise<{ ok: true; redeemId: string } | RedeemFail> {
	const found = tokenStore.get(token);
	if (!found) {
		return { ok: false, code: "INVALID_REDEEM_TOKEN", message: "redeem token not found" };
	}
	if (found.expiresAtMs < Date.now()) {
		tokenStore.delete(token);
		return { ok: false, code: "EXPIRED_REDEEM_TOKEN", message: "redeem token expired" };
	}

	const progress = await getOrInitProgress(found.employeeId);
	if (progress.rewardRedeemCount >= progress.maxRounds) {
		return {
			ok: false,
			code: "REDEEM_LIMIT_REACHED",
			message: "redeem limit reached for this player",
		};
	}

	progress.rewardRedeemCount += 1;
	const redeemId = `redeem_${found.employeeId}_${Date.now()}`;
	redeemHistory.push({
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
	return { totalRedeemed: redeemHistory.length };
}
