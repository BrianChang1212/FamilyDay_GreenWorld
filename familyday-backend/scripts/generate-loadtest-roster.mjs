/**
 * Generate a synthetic loadtest roster dump (1,300 docs by default).
 *
 * Usage:
 *   node ./scripts/generate-loadtest-roster.mjs <real-dump.json> <out.json>
 *
 * - employeeId pattern: LT900001..LT901300  (letter-prefixed → cannot collide
 *   with real 7-digit numeric employee IDs)
 * - name pattern: LoadTest-00001..LoadTest-01300
 * - eventId: familyday-2026  (same as production; isolation comes from the
 *   separate `loadtest` Firestore database, not eventId)
 * - Cross-checks against the supplied real-dump JSON and reports overlap.
 *   overlap must be 0 before import.
 *
 * Output JSON conforms to firestore-dumps schema so the existing
 * import-roster-dump.mjs can consume it directly.
 */
import fs from "node:fs";
import path from "node:path";

const COUNT = 1300;
const START = 900001;
const PREFIX = "LT";
const EVENT_ID = "familyday-2026";

const realDumpPath = process.argv[2];
const outPath = process.argv[3];
if (!outPath) {
	console.error(
		"Usage: node ./scripts/_tmp-generate-loadtest-roster.mjs <real-dump.json> <out.json>",
	);
	process.exit(1);
}

const now = new Date().toISOString();
const docs = [];
for (let i = 0; i < COUNT; i++) {
	const employeeId = `${PREFIX}${START + i}`;
	const name = `LoadTest-${String(i + 1).padStart(5, "0")}`;
	docs.push({
		id: `${EVENT_ID}_${employeeId}`,
		eventId: EVENT_ID,
		partySizePlanned: 1,
		employeeId,
		source: "import",
		name,
		updatedAt: now,
	});
}

let realCount = 0;
let overlap = 0;
if (realDumpPath && fs.existsSync(realDumpPath)) {
	const real = JSON.parse(fs.readFileSync(realDumpPath, "utf8"));
	const realIds = new Set((real.docs || []).map((d) => String(d.employeeId)));
	realCount = realIds.size;
	for (const doc of docs) {
		if (realIds.has(doc.employeeId)) overlap += 1;
	}
} else {
	console.error(`Cross-check skipped — real dump not found: ${realDumpPath}`);
	process.exit(1);
}

if (overlap !== 0) {
	console.error(
		`**FAIL** — overlap=${overlap} between synthetic and real roster; refusing to write.`,
	);
	process.exit(1);
}

const dump = {
	dumpedAt: now,
	projectId: "familyday-greenworld",
	databaseId: "loadtest",
	collection: "roster",
	count: COUNT,
	docs,
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(dump, null, 2), "utf8");

console.log("=== synthetic loadtest roster generated ===");
console.log(`count        : ${COUNT}`);
console.log(`first        : ${docs[0].employeeId}  (${docs[0].name})`);
console.log(`last         : ${docs[docs.length - 1].employeeId}  (${docs[docs.length - 1].name})`);
console.log(`cross-check  : real=${realCount}  overlap=${overlap}  PASS`);
console.log(`output       : ${outPath}`);
