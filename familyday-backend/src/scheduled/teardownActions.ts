/**
 * 一次性「對外下架」動作（純邏輯，無 onSchedule 包裝，便於測試與 dry-run）。
 *
 * 三個動作（皆作用於同一個 `familyday-greenworld` 專案）：
 *   1) Firebase Hosting → 建立 SITE_DISABLE release（前端顯示停用頁）
 *   2) Cloud Run `api` / `apiloadtest` → 移除 allUsers 的 run.invoker（API 全部 403）
 *   3) Cloud Scheduler → 暫停 `dumpCheckinsDaily` 排程（停每日 dump 信）
 *
 * `dryRun=true` 時只印出「將執行的動作」，完全不呼叫 API、不變更任何東西。
 * 執行身分為函式 runtime SA（fdgw-teardown，需 firebasehosting.admin / run.admin /
 * cloudscheduler.admin）。資料一律保留，不動 Firestore。
 */
import * as logger from "firebase-functions/logger";
import { GoogleAuth } from "google-auth-library";

const PROJECT = "familyday-greenworld";
const REGION = "us-central1";
/** Gen2 函式對應的 Cloud Run service 名稱（函式名小寫） */
const RUN_SERVICES = ["api", "apiloadtest"];
const HOSTING_SITE = "familyday-greenworld";
const DUMP_SCHEDULER_JOB = "firebase-schedule-dumpCheckinsDaily-us-central1";
const PUBLIC_MEMBER = "allUsers";
const INVOKER_ROLE = "roles/run.invoker";

async function token(): Promise<string> {
	const auth = new GoogleAuth({
		scopes: ["https://www.googleapis.com/auth/cloud-platform"],
	});
	return (await auth.getAccessToken()) as string;
}

export type TeardownResult = { action: string; ok: boolean; detail: string };

type IamBinding = { role: string; members?: string[] };
type IamPolicy = { bindings?: IamBinding[]; etag?: string; version?: number };

/**
 * 純函式：從 IAM policy 的 `roles/run.invoker` 綁定移除 `allUsers`（公開存取），
 * 其他成員與其他綁定原樣保留；移除後若該綁定無成員則整條丟棄。
 * 抽出以便單元測試此關鍵轉換（移錯成員 / 清空綁定會出 subtle bug）。
 */
export function withoutPublicInvoker(policy: IamPolicy): IamPolicy {
	return {
		...policy,
		bindings: (policy.bindings || [])
			.map((b) =>
				b.role === INVOKER_ROLE
					? { ...b, members: (b.members || []).filter((m) => m !== PUBLIC_MEMBER) }
					: b,
			)
			.filter((b) => (b.members || []).length > 0),
	};
}

async function disableHosting(dryRun: boolean): Promise<TeardownResult> {
	const url = `https://firebasehosting.googleapis.com/v1beta1/sites/${HOSTING_SITE}/releases?type=SITE_DISABLE`;
	if (dryRun) return { action: "hosting:disable", ok: true, detail: `DRY-RUN would POST ${url}` };
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
		body: "{}",
	});
	return { action: "hosting:disable", ok: res.ok, detail: `HTTP ${res.status}${res.ok ? "" : " " + (await res.text()).slice(0, 200)}` };
}

async function removeRunInvoker(service: string, dryRun: boolean): Promise<TeardownResult> {
	const base = `https://run.googleapis.com/v2/projects/${PROJECT}/locations/${REGION}/services/${service}`;
	if (dryRun) return { action: `run:remove-invoker:${service}`, ok: true, detail: `DRY-RUN would remove ${PUBLIC_MEMBER} from ${INVOKER_ROLE}` };
	const t = await token();
	const H = { Authorization: `Bearer ${t}`, "Content-Type": "application/json" };
	const pol = (await (await fetch(`${base}:getIamPolicy`, { headers: H })).json()) as IamPolicy;
	const next = withoutPublicInvoker(pol);
	const res = await fetch(`${base}:setIamPolicy`, { method: "POST", headers: H, body: JSON.stringify({ policy: next }) });
	return { action: `run:remove-invoker:${service}`, ok: res.ok, detail: `HTTP ${res.status}${res.ok ? "" : " " + (await res.text()).slice(0, 200)}` };
}

async function pauseSchedulerJob(dryRun: boolean): Promise<TeardownResult> {
	const url = `https://cloudscheduler.googleapis.com/v1/projects/${PROJECT}/locations/${REGION}/jobs/${DUMP_SCHEDULER_JOB}:pause`;
	if (dryRun) return { action: "scheduler:pause-dump", ok: true, detail: `DRY-RUN would POST ${url}` };
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
		body: "{}",
	});
	return { action: "scheduler:pause-dump", ok: res.ok, detail: `HTTP ${res.status}${res.ok ? "" : " " + (await res.text()).slice(0, 200)}` };
}

/** 依序執行三個下架動作；單一動作失敗不中斷其他動作（盡量關閉），最後彙整回傳。 */
export async function runTeardown(dryRun: boolean): Promise<TeardownResult[]> {
	const results: TeardownResult[] = [];
	const safe = async (fn: () => Promise<TeardownResult>, label: string) => {
		try { results.push(await fn()); }
		catch (e) { results.push({ action: label, ok: false, detail: e instanceof Error ? e.message : String(e) }); }
	};
	await safe(() => disableHosting(dryRun), "hosting:disable");
	for (const svc of RUN_SERVICES) await safe(() => removeRunInvoker(svc, dryRun), `run:remove-invoker:${svc}`);
	await safe(() => pauseSchedulerJob(dryRun), "scheduler:pause-dump");
	logger.info(`runTeardown(dryRun=${dryRun}) done`, { results });
	return results;
}
