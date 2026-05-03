/**
 * API smoke test: hits implemented /api/v1 routes in order (session cookie flow).
 *
 * Env:
 *   SMOKE_API_BASE — API root including /api suffix (no /api/v1). Default: local emulator.
 *   SMOKE_EMPLOYEE_ID — default E2E1001
 *   SMOKE_EMPLOYEE_NAME — default FrontendTester
 */

const API_ROOT =
	process.env.SMOKE_API_BASE ||
	process.env.VERIFY_API_BASE ||
	"http://127.0.0.1:5003/familyday-greenworld-dev/us-central1/api/api/v1";

const EMPLOYEE_ID = process.env.SMOKE_EMPLOYEE_ID || "E2E1001";
const EMPLOYEE_NAME = process.env.SMOKE_EMPLOYEE_NAME || "FrontendTester";

const emp = { employeeId: EMPLOYEE_ID, name: EMPLOYEE_NAME };

/** @type {{ name: string; status: number; ok: boolean; expected?: string }[]} */
const results = [];
let cookie = "";

async function call(name, path, opt = {}) {
	const headers = { accept: "application/json", ...(opt.headers || {}) };
	if (cookie) {
		headers.cookie = cookie;
	}
	const res = await fetch(`${API_ROOT}${path}`, {
		method: opt.method || "GET",
		headers,
		body: opt.body,
	});
	const text = await res.text();
	let body = text;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = text;
	}
	const setCookie = res.headers.get("set-cookie");
	if (setCookie && path.includes("auth/login")) {
		cookie = setCookie.split(";")[0];
	}
	results.push({ name, status: res.status, ok: res.ok });
	return { res, body };
}

function expectStatus(name, status, allowed) {
	const row = results.find((r) => r.name === name);
	if (!row) {
		throw new Error(`missing result: ${name}`);
	}
	if (!allowed.includes(row.status)) {
		throw new Error(
			`${name}: expected status in [${allowed.join(",")}], got ${row.status}`,
		);
	}
	row.expected = allowed.join("|");
}

async function run() {
	await call("health", "/health");
	await call("health_ready", "/health/ready");
	await call("auth_me_unauth", "/auth/me");
	await call("roster_import", "/admin/roster/import", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			items: [{ employeeId: emp.employeeId, name: emp.name, partySizePlanned: 2 }],
		}),
	});
	await call("auth_login", "/auth/login", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(emp),
	});
	await call("auth_me", "/auth/me");
	await call("checkin", "/checkin", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ ...emp, partySize: 2 }),
	});
	await call(
		"checkin_status",
		`/checkin/status?employeeId=${encodeURIComponent(emp.employeeId)}`,
	);
	const v = await call("stations_verify", "/stations/verify", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ stageId: 1, qrJwt: "stage-1-token" }),
	});
	const challengeId = v.body?.challengeId || "c1";
	await call("challenge_get", `/challenges/${encodeURIComponent(challengeId)}`);
	await call(
		"challenge_attempt",
		`/challenges/${encodeURIComponent(challengeId)}/attempts`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ choiceId: "B" }),
		},
	);
	await call("dashboard", "/me/dashboard");
	await call("restart_expected_409", "/me/playthrough/restart", {
		method: "POST",
	});
	const tok = await call("redeem_token", "/staff/redeem/token", {
		method: "POST",
	});
	const token = tok.body?.token;
	if (token) {
		await call("redeem_confirm", "/staff/redeem/confirm", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ staffId: "staff-smoke", token }),
		});
	}
	await call("report_attendance", "/admin/reports/attendance");
	await call("report_progress", "/admin/reports/progress");
	await call("auth_logout", "/auth/logout", { method: "POST" });

	expectStatus("health", 200, [200]);
	expectStatus("health_ready", 200, [200]);
	expectStatus("auth_me_unauth", 401, [401]);
	expectStatus("roster_import", 200, [200]);
	expectStatus("auth_login", 200, [200]);
	expectStatus("auth_me", 200, [200]);
	expectStatus("checkin", 200, [200]);
	expectStatus("checkin_status", 200, [200]);
	expectStatus("stations_verify", 200, [200]);
	expectStatus("challenge_get", 200, [200]);
	expectStatus("challenge_attempt", 200, [200]);
	expectStatus("dashboard", 200, [200]);
	expectStatus("restart_expected_409", 409, [409]);
	expectStatus("redeem_token", 200, [200]);
	expectStatus("redeem_confirm", 200, [200, 409]);
	expectStatus("report_attendance", 200, [200]);
	expectStatus("report_progress", 200, [200]);
	expectStatus("auth_logout", 200, [200]);

	console.log(JSON.stringify({ apiRoot: API_ROOT, employeeId: EMPLOYEE_ID, results }, null, 2));
	console.log("PASS smoke:api");
}

run().catch((err) => {
	console.error(`FAIL smoke:api: ${err.message}`);
	process.exit(1);
});
