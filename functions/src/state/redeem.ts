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

export function issueRedeemToken(employeeId: string, ttlSec = 300): {
	token: string;
	expiresInSec: number;
} {
	const token = randomToken();
	const expiresAtMs = Date.now() + ttlSec * 1000;
	tokenStore.set(token, { token, employeeId, expiresAtMs });
	return { token, expiresInSec: ttlSec };
}

export function confirmRedeem(
	token: string,
	staffId: string,
): { ok: true; redeemId: string } | { ok: false; code: string; message: string } {
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

export function getRedeemSummary(): { totalRedeemed: number } {
	return { totalRedeemed: redeemedByEmployee.size };
}
