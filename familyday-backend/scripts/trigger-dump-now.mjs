/**
 * Force-trigger the dumpCheckinsDaily Cloud Scheduler job immediately.
 * Requires GOOGLE_APPLICATION_CREDENTIALS and FDGW_FIREBASE_PROJECT_ID.
 */
import { GoogleAuth } from "google-auth-library";
import process from "node:process";

const PROJECT = process.env.FDGW_FIREBASE_PROJECT_ID || "familyday-greenworld";
const REGION = "us-central1";
const JOB = `projects/${PROJECT}/locations/${REGION}/jobs/firebase-schedule-dumpCheckinsDaily-${REGION}`;

const auth = new GoogleAuth({
	scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const client = await auth.getClient();
const res = await client.request({
	url: `https://cloudscheduler.googleapis.com/v1/${JOB}:run`,
	method: "POST",
	data: {},
});

console.log(`Status: ${res.status}`);
console.log(JSON.stringify(res.data, null, 2));
console.log("Job triggered — 等待約 10~30 秒後至信箱確認。");
