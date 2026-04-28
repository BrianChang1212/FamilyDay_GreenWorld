const base = process.env.MOCK_API_BASE || "http://localhost:8787";

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

function ensure(cond, message) {
	if (!cond) {
		throw new Error(message);
	}
}

async function main() {
	/* 闖關入口驗證 */
	await req("entry verify", "POST", "/api/v1/entry/verify", {
		token: "game-entry-token",
	});

	/* 闖關登入失敗（姓名/員編不匹配） */
	await req("auth login mismatch", "POST", "/api/v1/auth/login", {
		employeeId: "1141041",
		name: "Wrong Name",
	}, 401);

	/* 闖關登入與使用者資訊（匹配） */
	const login = await req("auth login", "POST", "/api/v1/auth/login", {
		employeeId: "1141041",
		name: "Brian",
	});
	ensure(login?.ok === true, "auth login should return ok=true");

	const me = await req("auth me", "GET", "/api/v1/auth/me");
	ensure(typeof me?.employeeId === "string", "auth me should return employeeId");

	/* 闖關主頁資料 */
	const dashboard = await req("dashboard", "GET", "/api/v1/me/dashboard");
	ensure(
		Array.isArray(dashboard?.stages),
		"dashboard should return stages array",
	);
	ensure(
		typeof dashboard?.progress === "object" && dashboard.progress !== null,
		"dashboard should return progress object",
	);

	/* 站點驗證與題目流程 */
	const verify = await req("station verify", "POST", "/api/v1/stations/verify", {
		token: "station-token",
	});
	ensure(
		typeof verify?.challengeId === "string",
		"stations verify should return challengeId",
	);

	const challengeId = verify.challengeId;
	const challenge = await req(
		"challenge get",
		"GET",
		`/api/v1/challenges/${challengeId}`,
	);
	ensure(Array.isArray(challenge?.options), "challenge get should return options");

	const attemptWrong = await req(
		"challenge attempts wrong",
		"POST",
		`/api/v1/challenges/${challengeId}/attempts`,
		{ answer: "5種" },
	);
	ensure(attemptWrong?.correct === false, "wrong attempt should return correct=false");

	const attemptRight = await req(
		"challenge attempts right",
		"POST",
		`/api/v1/challenges/${challengeId}/attempts`,
		{ answer: "10種" },
	);
	ensure(attemptRight?.correct === true, "right attempt should return correct=true");

	/* 再玩一輪 */
	const restart = await req(
		"playthrough restart",
		"POST",
		"/api/v1/me/playthrough/restart",
	);
	ensure(restart?.ok === true, "restart should return ok=true");

	/* 登出 */
	await req("auth logout", "POST", "/api/v1/auth/logout");

	console.log("\nGame flow API checks passed.");
}

main().catch((err) => {
	console.error(`\nGame flow API test failed: ${err.message}`);
	process.exit(1);
});
