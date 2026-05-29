/**
 * 壓測後對 loadtest db 做一致性檢查（揭露 RMW race condition）。
 *
 * 跑前需設：
 *   GOOGLE_APPLICATION_CREDENTIALS = 正式 SA JSON
 *   FDGW_FIREBASE_PROJECT_ID       = familyday-greenworld
 *   GOOGLE_CLOUD_PROJECT           = familyday-greenworld
 *   FDGW_FIRESTORE_DATABASE_ID     = loadtest   (重要!)
 */
import process from "node:process";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
	initializeApp({ credential: applicationDefault() });
}
const dbIdRaw = (process.env.FDGW_FIRESTORE_DATABASE_ID || "").trim();
const dbId = !dbIdRaw || dbIdRaw === "default" || dbIdRaw === "(default)" ? null : dbIdRaw;
const db = dbId ? getFirestore(dbId) : getFirestore();
console.log(`Reading from database: ${dbId || "(default)"}`);

const expected = [1, 2, 3, 4, 5, 6];

const stats = {
	collections: {},
	progress_buckets: {
		full_cleared: 0,           // completedStageIds 完整 [1..6]
		partial: 0,                // 有完成但缺號 → 強烈 race signal
		empty_or_none: 0,          // completedStageIds 為空
	},
	full_clear_counters: {
		fullClearCount_zero_but_complete: 0,
		bankedFullClears_zero_but_complete: 0,
	},
	anomaly_samples: [],            // 前 20 筆異常細節
};

for (const c of ["roster", "checkins", "player_progress", "redeem_tokens", "redeem_records"]) {
	const snap = await db.collection(c).get();
	stats.collections[c] = snap.size;
}

const progressSnap = await db.collection("player_progress").get();
let progressTotal = 0;
let partialDocs = [];
let zeroFccSamples = [];

for (const doc of progressSnap.docs) {
	progressTotal += 1;
	const p = doc.data();
	const completed = Array.isArray(p.completedStageIds)
		? p.completedStageIds.map((n) => Number(n)).filter((n) => Number.isFinite(n))
		: [];
	const isFull = expected.every((s) => completed.includes(s));
	const isPartial = completed.length > 0 && !isFull;
	const isEmpty = completed.length === 0;

	if (isFull) stats.progress_buckets.full_cleared += 1;
	else if (isPartial) {
		stats.progress_buckets.partial += 1;
		partialDocs.push({
			id: doc.id,
			completedStageIds: completed,
			missing: expected.filter((s) => !completed.includes(s)),
			currentStageId: p.currentStageId ?? null,
			fullClearCount: p.fullClearCount ?? null,
			bankedFullClears: p.bankedFullClears ?? null,
		});
	} else if (isEmpty) stats.progress_buckets.empty_or_none += 1;

	if (isFull) {
		const fcc = Number(p.fullClearCount || 0);
		const bfc = Number(p.bankedFullClears || 0);
		if (fcc === 0 && bfc === 0) {
			zeroFccSamples.push({
				id: doc.id,
				fullClearCount: fcc,
				bankedFullClears: bfc,
				rewardRedeemCount: p.rewardRedeemCount ?? null,
			});
		}
		if (fcc === 0) stats.full_clear_counters.fullClearCount_zero_but_complete += 1;
		if (bfc === 0) stats.full_clear_counters.bankedFullClears_zero_but_complete += 1;
	}
}

stats.anomaly_samples = partialDocs.slice(0, 20);
const zeroSampleN = Math.min(20, zeroFccSamples.length);

console.log("=== collection counts ===");
console.log(JSON.stringify(stats.collections, null, 2));
console.log();
console.log("=== player_progress buckets ===");
console.log(`  total examined            : ${progressTotal}`);
console.log(`  full_cleared (完整 [1..6]) : ${stats.progress_buckets.full_cleared}`);
console.log(`  partial (缺號 = race?)      : ${stats.progress_buckets.partial}`);
console.log(`  empty / not started         : ${stats.progress_buckets.empty_or_none}`);
console.log();
console.log("=== full-clear counter sanity (僅 full_cleared 內) ===");
console.log(`  fullClearCount=0 但全破     : ${stats.full_clear_counters.fullClearCount_zero_but_complete}`);
console.log(`  bankedFullClears=0 但全破   : ${stats.full_clear_counters.bankedFullClears_zero_but_complete}`);
if (zeroSampleN > 0) {
	console.log("  -- 前 N 筆樣本 --");
	console.log(JSON.stringify(zeroFccSamples.slice(0, zeroSampleN), null, 2));
}
console.log();
if (stats.anomaly_samples.length > 0) {
	console.log(`=== partial docs (前 ${stats.anomaly_samples.length} 筆) ===`);
	console.log(JSON.stringify(stats.anomaly_samples, null, 2));
} else {
	console.log("=== partial docs: 0 → 沒看到 stage append RMW race");
}
