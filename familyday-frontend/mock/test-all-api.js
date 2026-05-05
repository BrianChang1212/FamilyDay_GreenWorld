import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = process.env.MOCK_API_BASE || "http://localhost:8787";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fdgwEventId() {
	try {
		const j = JSON.parse(
			readFileSync(path.join(__dirname, "..", "..", "fdgw.project.json"), "utf8"),
		);
		return typeof j.eventId === "string" ? j.eventId : "familyday-2026";
	} catch {
		return "familyday-2026";
	}
}

async function req(name, method, path, body, expectStatus = 200) {
	const res = await fetch(`${base}${path}`, {
		method,
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});

	let json = null;
	try {
		json = await res.json();
	} catch {
		json = null;
	}

	const pass = res.status === expectStatus;
	const marker = pass ? "PASS" : "FAIL";
	console.log(`[${marker}] ${name} -> ${res.status}`);
	if (!pass) {
		console.log(`  expected=${expectStatus} got=${res.status}`);
		if (json) {
			console.log(`  body=${JSON.stringify(json)}`);
		}
		throw new Error(`Test failed: ${name}`);
	}
	return json;
}

async function main() {
	await req("health", "GET", "/api/v1/health");
	await req("health ready", "GET", "/api/v1/health/ready");
	await req("events", "GET", `/api/v1/events/${fdgwEventId()}`);
	await req("entry verify", "POST", "/api/v1/entry/verify", {
		token: "mock-token",
	});
	await req("checkin", "POST", "/api/v1/checkin", {
		employeeId: "1141041",
		name: "Brian",
		partySize: 3,
	});
	await req("checkin status", "GET", "/api/v1/checkin/status");
	await req("auth login", "POST", "/api/v1/auth/login", {
		employeeId: "1141041",
		name: "Brian",
	});
	await req("auth me", "GET", "/api/v1/auth/me");
	await req("auth logout", "POST", "/api/v1/auth/logout");
	await req("dashboard", "GET", "/api/v1/me/dashboard");
	await req(
		"dashboard missing",
		"GET",
		"/api/v1/me/dashboard?scenario=missing",
	);
	await req(
		"dashboard invalid",
		"GET",
		"/api/v1/me/dashboard?scenario=invalid",
	);
	await req("dashboard full", "GET", "/api/v1/me/dashboard?scenario=full");
	await req("dashboard empty", "GET", "/api/v1/me/dashboard?scenario=empty");
	await req("dashboard error", "GET", "/api/v1/me/dashboard?scenario=error", null, 500);
	await req("me progress", "GET", "/api/v1/me/progress");
	await req(
		"me progress full",
		"GET",
		"/api/v1/me/progress?scenario=full",
	);
	await req("me progress error", "GET", "/api/v1/me/progress?scenario=error", null, 500);
	await req("station verify", "POST", "/api/v1/stations/verify", {
		token: "station-token",
	});
	await req("challenge get", "GET", "/api/v1/challenges/c1");
	await req("challenge attempts", "POST", "/api/v1/challenges/c1/attempts", {
		answer: "A",
	});
	await req("playthrough restart", "POST", "/api/v1/me/playthrough/restart");
	await req("reward claim", "POST", "/api/v1/me/reward/claim", {});
	await req("staff redeem token", "POST", "/api/v1/staff/redeem/token");
	await req("staff redeem confirm", "POST", "/api/v1/staff/redeem/confirm", {
		token: "mock-redeem-token",
	});
	await req("admin roster import", "POST", "/api/v1/admin/roster/import", {
		version: "mock",
	});
	await req("admin attendance", "GET", "/api/v1/admin/reports/attendance");
	await req("admin progress", "GET", "/api/v1/admin/reports/progress");

	console.log("\nAll API checks passed.");
}

main().catch((err) => {
	console.error(`\nAPI test failed: ${err.message}`);
	process.exit(1);
});
