/**
 * 刪除指定員工的 player_progress doc(玩家「硬重置」)。
 * 用途:測試/演練——下次 getOrInitProgress 會自動以 defaultProgress() 新建,
 *       連同 rewardRedeemCount/bankedFullClears 一起歸零,等於可再領 3 次獎。
 *
 * Usage:
 *   FDGW_FIRESTORE_DATABASE_ID=loadtest node ./scripts/delete-player-progress.mjs LT900003
 *
 * 環境變數: GOOGLE_APPLICATION_CREDENTIALS, FDGW_FIRESTORE_DATABASE_ID
 */
import process from "node:process";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) initializeApp({ credential: applicationDefault() });
const raw = (process.env.FDGW_FIRESTORE_DATABASE_ID || "").trim();
const dbId = !raw || raw === "default" || raw === "(default)" ? null : raw;
const db = dbId ? getFirestore(dbId) : getFirestore();

const empId = process.argv[2];
if (!empId) {
	console.error("Usage: node ./scripts/_tmp-delete-player-progress.mjs <employeeId>");
	process.exit(1);
}

const ref = db.collection("player_progress").doc(empId);
const before = await ref.get();
if (!before.exists) {
	console.log(`Nothing to delete: player_progress/${empId} does not exist in ${dbId || "(default)"} db`);
	process.exit(0);
}
await ref.delete();
console.log(`Deleted player_progress/${empId} from ${dbId || "(default)"} db. Pre-delete data:`);
console.log(JSON.stringify(before.data(), null, 2));
