import fs from "node:fs";
import process from "node:process";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const API_BASE =
	process.env.VERIFY_API_BASE ||
	"http://127.0.0.1:5003/familyday-greenworld-dev/us-central1/api/api/v1";
const EMPLOYEE_ID = process.env.VERIFY_EMPLOYEE_ID || "1141043";
const EMPLOYEE_NAME = process.env.VERIFY_EMPLOYEE_NAME || "Bob";

function assertPreconditions() {
	if ((process.env.FDGW_USE_FIRESTORE || "").toLowerCase() !== "true") {
		throw new Error("FDGW_USE_FIRESTORE must be true before running verification.");
	}

	const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
	if (!credPath) {
		throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set.");
	}
	if (!fs.existsSync(credPath)) {
		throw new Error(`Credential file does not exist: ${credPath}`);
	}
}

function initDb() {
	if (getApps().length === 0) {
		initializeApp({ credential: applicationDefault() });
	}
	return getFirestore();
}

async function api(path, options = {}, cookie = "") {
	const headers = { ...(options.headers || {}) };
	if (cookie) {
		headers.cookie = cookie;
	}
	const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
	const text = await res.text();
	let body = null;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = text;
	}
	return { status: res.status, headers: res.headers, body };
}

async function run() {
	assertPreconditions();
	const db = initDb();

	const login = await api("/auth/login", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ employeeId: EMPLOYEE_ID, name: EMPLOYEE_NAME }),
	});
	if (login.status !== 200) {
		throw new Error(`Login failed: ${login.status} ${JSON.stringify(login.body)}`);
	}
	const setCookie = login.headers.get("set-cookie") || "";
	const cookie = setCookie.split(";")[0];
	if (!cookie) {
		throw new Error("Login did not return session cookie.");
	}

	const checkin = await api(
		"/checkin",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				employeeId: EMPLOYEE_ID,
				name: EMPLOYEE_NAME,
				partySize: 2,
			}),
		},
		cookie,
	);
	if (checkin.status !== 200) {
		throw new Error(`Checkin failed: ${checkin.status} ${JSON.stringify(checkin.body)}`);
	}

	const verify = await api(
		"/stations/verify",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ stageId: 1, qrJwt: "verify-script-token" }),
		},
		cookie,
	);
	if (verify.status !== 200 || !verify.body?.challengeId) {
		throw new Error(`stations/verify failed: ${verify.status} ${JSON.stringify(verify.body)}`);
	}

	const challengeId = verify.body.challengeId;
	const attempt = await api(
		`/challenges/${encodeURIComponent(challengeId)}/attempts`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ choiceId: "B" }),
		},
		cookie,
	);
	if (attempt.status !== 200) {
		throw new Error(`attempt failed: ${attempt.status} ${JSON.stringify(attempt.body)}`);
	}

	const tokenResp = await api("/staff/redeem/token", { method: "POST" }, cookie);
	if (tokenResp.status !== 200 || !tokenResp.body?.token) {
		throw new Error(`redeem/token failed: ${tokenResp.status} ${JSON.stringify(tokenResp.body)}`);
	}

	const confirm = await api(
		"/staff/redeem/confirm",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ staffId: "staff-verify", token: tokenResp.body.token }),
		},
		cookie,
	);
	if (![200, 409].includes(confirm.status)) {
		throw new Error(`redeem/confirm unexpected: ${confirm.status} ${JSON.stringify(confirm.body)}`);
	}

	const [checkinDoc, progressDoc, redeemDoc] = await Promise.all([
		db.collection("checkins").doc(EMPLOYEE_ID).get(),
		db.collection("player_progress").doc(EMPLOYEE_ID).get(),
		db.collection("redeem_records").doc(EMPLOYEE_ID).get(),
	]);

	if (!checkinDoc.exists) {
		throw new Error("Firestore check failed: checkins doc not found.");
	}
	if (!progressDoc.exists) {
		throw new Error("Firestore check failed: player_progress doc not found.");
	}
	if (!redeemDoc.exists) {
		throw new Error("Firestore check failed: redeem_records doc not found.");
	}

	console.log(
		`PASS firestore verification employee=${EMPLOYEE_ID} challenge=${challengeId} confirmStatus=${confirm.status}`,
	);
}

run().catch((err) => {
	console.error(`FAIL firestore verification: ${err.message}`);
	process.exit(1);
});
