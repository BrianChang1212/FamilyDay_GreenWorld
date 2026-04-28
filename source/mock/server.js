import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";

const port = Number(process.env.MOCK_API_PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "db.json");
const challenges = [
	{
		id: "c1",
		title: "請問天鵝湖裡有幾種品種的天鵝？",
		options: ["5種", "10種", "30種", "42種"],
		correct: "10種",
	},
	{
		id: "c2",
		title: "開闊草原最能支持下列哪一種生態角色？",
		options: ["深海魚類", "草食動物與昆蟲棲地", "珊瑚蟲", "企鵝繁殖"],
		correct: "草食動物與昆蟲棲地",
	},
	{
		id: "c3",
		title: "在森林步道行走時，較恰當的作法是？",
		options: ["離開步道抄近路", "依告示與動線前進", "大聲播放音樂驅蟲", "隨意摘取植物帶回"],
		correct: "依告示與動線前進",
	},
	{
		id: "c4",
		title: "松鼠常把食物藏起來，主要是為了？",
		options: ["當作玩具", "度過食物較少的時段", "吸引遊客拍照", "築巢防水"],
		correct: "度過食物較少的時段",
	},
	{
		id: "c5",
		title: "「昆蟲飯店」這類設施主要目的接近？",
		options: ["飼養寵物昆蟲販售", "提供授粉與益蟲棲息空間", "防治所有蚊蟲", "收集垃圾"],
		correct: "提供授粉與益蟲棲息空間",
	},
	{
		id: "c6",
		title: "完成所有站點後，下列何者最合適？",
		options: ["隨意丟棄垃圾", "將野生動物帶回家", "回顧所學並支持保育", "破壞告示設施"],
		correct: "回顧所學並支持保育",
	},
];

const defaultDb = {
	employees: [
		{ employeeId: "1141041", name: "Brian" },
		{ employeeId: "1141042", name: "Alice" },
		{ employeeId: "1141043", name: "Bob" },
		{ employeeId: "1141044", name: "Charlie" },
		{ employeeId: "1141045", name: "David" },
		{ employeeId: "1141046", name: "Emma" },
		{ employeeId: "1141047", name: "Frank" },
		{ employeeId: "1141048", name: "Grace" },
		{ employeeId: "1141049", name: "Helen" },
		{ employeeId: "1141050", name: "Ivy" },
	],
	checkins: [],
};

function applyCors(req, res) {
	const reqOrigin = req.headers.origin;
	const allowOrigin = reqOrigin || "http://localhost:5174";
	res.setHeader("Access-Control-Allow-Origin", allowOrigin);
	res.setHeader("Vary", "Origin");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,POST,PUT,PATCH,DELETE,OPTIONS",
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Accept",
	);
}

function writeJson(res, statusCode, payload) {
	res.writeHead(statusCode, { "Content-Type": "application/json" });
	res.end(JSON.stringify(payload));
}

function getScenario(urlObj) {
	return (urlObj.searchParams.get("scenario") || "ok").toLowerCase();
}

function buildDashboardProgress(scenario) {
	switch (scenario) {
	case "missing":
		return {};
	case "invalid":
		return {
			maxRounds: 3,
			rewardRedeemCount: 999,
			fullClearCount: -5,
		};
	case "full":
		return {
			maxRounds: 3,
			rewardRedeemCount: 3,
			fullClearCount: 3,
		};
	case "empty":
		return {
			maxRounds: 3,
			rewardRedeemCount: 0,
			fullClearCount: 0,
		};
	default:
		return {
			maxRounds: 3,
			rewardRedeemCount: 2,
			fullClearCount: 2,
		};
	}
}

function readJsonBody(req) {
	return new Promise((resolve, reject) => {
		let raw = "";
		req.on("data", (chunk) => {
			raw += chunk;
		});
		req.on("end", () => {
			if (!raw) {
				resolve({});
				return;
			}
			try {
				resolve(JSON.parse(raw));
			} catch (err) {
				reject(err);
			}
		});
		req.on("error", reject);
	});
}

function firstMatch(pathname, regex) {
	const m = pathname.match(regex);
	return m?.[1] ?? "";
}

async function readDb() {
	try {
		const raw = await fs.readFile(dbPath, "utf8");
		const data = JSON.parse(raw);
		if (!Array.isArray(data.employees) || !Array.isArray(data.checkins)) {
			return { ...defaultDb };
		}
		return data;
	} catch {
		await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
		return { ...defaultDb };
	}
}

async function writeDb(data) {
	await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf8");
}

function toPositiveInt(raw, fallback = 1) {
	const n = Number(raw);
	if (!Number.isFinite(n) || n < 1) {
		return fallback;
	}
	return Math.floor(n);
}

function normalizeStr(v) {
	return String(v || "").trim();
}

function challengeIdByStageToken(token) {
	const m = String(token || "").match(/^stage-(\d+)-token$/);
	if (!m) {
		return "c1";
	}
	const n = Number(m[1]);
	if (!Number.isFinite(n) || n < 1 || n > 6) {
		return "c1";
	}
	return `c${n}`;
}

function nextChallengeIdByCurrent(currentId) {
	const idx = challenges.findIndex((c) => c.id === currentId);
	if (idx < 0 || idx + 1 >= challenges.length) {
		return "";
	}
	return challenges[idx + 1].id;
}

const server = http.createServer((req, res) => {
	applyCors(req, res);
	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	const origin = `http://${req.headers.host || "localhost"}`;
	const urlObj = new URL(req.url || "/", origin);
	const scenario = getScenario(urlObj);

	if (req.method === "GET" && urlObj.pathname === "/api/v1/health") {
		return writeJson(res, 200, { ok: true, source: "mock-api" });
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/health/ready") {
		return writeJson(res, 200, { ok: true, ready: true, source: "mock-api" });
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/events/familyday-2026") {
		return writeJson(res, 200, {
			eventId: "familyday-2026",
			name: "Family Day GreenWorld",
			isOpen: true,
			configVersion: "mock-v1",
		});
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/entry/verify") {
		return readJsonBody(req)
			.then((body) => {
				if (!body.token) {
					writeJson(res, 400, {
						code: "MISSING_TOKEN",
						message: "token is required",
					});
					return;
				}
				writeJson(res, 200, {
					ok: true,
					entry: "game",
				});
			})
			.catch(() =>
				writeJson(res, 400, {
					code: "INVALID_JSON",
					message: "invalid json body",
				}),
			);
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/checkin") {
		return readJsonBody(req)
			.then(async (body) => {
				if (!body.employeeId || !body.name || !body.partySize) {
					writeJson(res, 400, {
						code: "INVALID_CHECKIN_PAYLOAD",
						message: "employeeId, name, partySize are required",
					});
					return;
				}

				const db = await readDb();
				const now = new Date().toISOString();
				const employeeId = normalizeStr(body.employeeId);
				const name = normalizeStr(body.name);
				const matchedEmployee = db.employees.find(
					(v) =>
						normalizeStr(v.employeeId) === employeeId &&
						normalizeStr(v.name) === name,
				);
				if (!matchedEmployee) {
					writeJson(res, 401, {
						code: "CHECKIN_IDENTITY_MISMATCH",
						message: "name and employeeId do not match mock db",
					});
					return;
				}

				const existing = db.checkins.findIndex(
					(v) => v.employeeId === employeeId,
				);
				const record = {
					employeeId,
					name,
					partySize: toPositiveInt(body.partySize),
					checkinAt: now,
				};
				if (existing >= 0) {
					db.checkins[existing] = record;
				} else {
					db.checkins.push(record);
				}
				await writeDb(db);

				writeJson(res, 200, {
					ok: true,
					checkinId: `checkin_${employeeId}`,
					checkinAt: now,
				});
			})
			.catch(() =>
				writeJson(res, 400, {
					code: "INVALID_JSON",
					message: "invalid json body",
				}),
			);
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/checkin/status") {
		return readDb()
			.then((db) => {
				const employeeId = urlObj.searchParams.get("employeeId") || "";
				const byEmployee = employeeId
					? db.checkins.find(
							(v) => v.employeeId === employeeId.trim(),
					  )
					: null;
				const latest =
					byEmployee ??
					db.checkins
						.slice()
						.sort((a, b) => b.checkinAt.localeCompare(a.checkinAt))[0];

				if (!latest) {
					writeJson(res, 200, {
						checkedIn: false,
						checkinAt: null,
					});
					return;
				}
				writeJson(res, 200, {
					checkedIn: true,
					checkinAt: latest.checkinAt,
					employeeId: latest.employeeId,
					name: latest.name,
					partySize: latest.partySize,
				});
			})
			.catch(() =>
				writeJson(res, 500, {
					code: "DB_READ_FAILED",
					message: "failed to read mock db",
				}),
			);
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/auth/login") {
		return readJsonBody(req)
			.then(async (body) => {
				const employeeId = normalizeStr(body.employeeId);
				const name = normalizeStr(body.name);
				if (!employeeId || !name) {
					writeJson(res, 400, {
						code: "INVALID_AUTH_PAYLOAD",
						message: "employeeId and name are required",
					});
					return;
				}

				const db = await readDb();
				const matchedEmployee = db.employees.find(
					(v) =>
						normalizeStr(v.employeeId) === employeeId &&
						normalizeStr(v.name) === name,
				);
				if (!matchedEmployee) {
					writeJson(res, 401, {
						code: "AUTH_IDENTITY_MISMATCH",
						message: "name and employeeId do not match mock db",
					});
					return;
				}

				writeJson(res, 200, {
					ok: true,
					user: {
						employeeId,
						name,
					},
				});
			})
			.catch(() =>
				writeJson(res, 400, {
					code: "INVALID_JSON",
					message: "invalid json body",
				}),
			);
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/auth/logout") {
		return writeJson(res, 200, { ok: true });
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/auth/me") {
		return writeJson(res, 200, {
			employeeId: "E12345",
			name: "Mock User",
			displayName: "Mock User",
		});
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/me/dashboard") {
		if (scenario === "error") {
			return writeJson(res, 500, {
				code: "MOCK_DASHBOARD_ERROR",
				message: "Mock dashboard internal error",
			});
		}

		return writeJson(res, 200, {
			stages: [
				{ stageId: "s1", completed: true },
				{ stageId: "s2", completed: false },
			],
			progress: buildDashboardProgress(scenario),
		});
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/stations/verify") {
		return readJsonBody(req)
			.then((body) => {
				const challengeId = challengeIdByStageToken(body.token);
				writeJson(res, 200, {
					ok: true,
					challengeId,
					stationId: "station-a",
				});
			})
			.catch(() =>
				writeJson(res, 400, {
					code: "INVALID_JSON",
					message: "invalid json body",
				}),
			);
	}

	if (req.method === "GET" && /^\/api\/v1\/challenges\/[^/]+$/.test(urlObj.pathname)) {
		const challengeId = firstMatch(urlObj.pathname, /^\/api\/v1\/challenges\/([^/]+)$/);
		const found = challenges.find((c) => c.id === challengeId) || challenges[0];
		return writeJson(res, 200, {
			challengeId: found.id,
			title: found.title,
			options: found.options,
		});
	}

	if (
		req.method === "POST" &&
		/^\/api\/v1\/challenges\/[^/]+\/attempts$/.test(urlObj.pathname)
	) {
		return readJsonBody(req)
			.then((body) => {
				const challengeId = firstMatch(
					urlObj.pathname,
					/^\/api\/v1\/challenges\/([^/]+)\/attempts$/,
				);
				const found = challenges.find((c) => c.id === challengeId) || challenges[0];
				const answer = normalizeStr(body.answer);
				const correct = answer === normalizeStr(found.correct);
				writeJson(res, 200, {
					correct,
					nextChallengeId: correct
						? nextChallengeIdByCurrent(found.id)
						: found.id,
				});
			})
			.catch(() =>
				writeJson(res, 400, {
					code: "INVALID_JSON",
					message: "invalid json body",
				}),
			);
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/me/playthrough/restart") {
		return writeJson(res, 200, {
			ok: true,
			fullClearCount: 1,
			remainingRounds: 2,
		});
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/staff/redeem/token") {
		return writeJson(res, 200, {
			token: "mock-redeem-token",
			expiresInSec: 300,
		});
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/staff/redeem/confirm") {
		return writeJson(res, 200, {
			ok: true,
			redeemId: "redeem_mock_1",
		});
	}

	if (req.method === "POST" && urlObj.pathname === "/api/v1/admin/roster/import") {
		return writeJson(res, 200, {
			ok: true,
			importedCount: 3,
		});
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/admin/reports/attendance") {
		return writeJson(res, 200, {
			total: 1000,
			checkedIn: 750,
		});
	}

	if (req.method === "GET" && urlObj.pathname === "/api/v1/admin/reports/progress") {
		return writeJson(res, 200, {
			players: 700,
			fullClear: 420,
		});
	}

	return writeJson(res, 404, {
		code: "NOT_FOUND",
		message: "Mock endpoint not found",
		path: urlObj.pathname,
	});
});

server.listen(port, () => {
	console.log(`Mock API running at http://localhost:${port}`);
	console.log(
		"Dashboard scenarios: ok | missing | invalid | full | empty | error",
	);
	console.log(
		`Example: http://localhost:${port}/api/v1/me/dashboard?scenario=invalid`,
	);
});
