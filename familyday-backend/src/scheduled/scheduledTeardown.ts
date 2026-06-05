/**
 * 一次性排程下架：2026-07-17 23:00 (Asia/Taipei) 自動把 FamilyDay GreenWorld
 * 前後端對外關閉（Hosting disable + Cloud Run 移 invoker + 暫停每日 dump）。
 *
 * 全雲端執行（Cloud Scheduler 由部署自動建立），以最小權限專用 SA
 * `fdgw-teardown@familyday-greenworld.iam.gserviceaccount.com` 身分執行。
 * cron `0 23 17 7 *` 表每年 7/17 23:00；本活動僅 2026 一次有效，重複觸發為冪等
 * （已關閉再關仍是關閉）。資料保留，不動 Firestore。復原見 scripts/restore-production.ps1。
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { getFunctionsRegion } from "../config/fdgwProject";
import { runTeardown } from "./teardownActions";

const TEARDOWN_SA = "fdgw-teardown@familyday-greenworld.iam.gserviceaccount.com";

export const scheduledTeardown = onSchedule(
	{
		schedule: "0 23 17 7 *",
		timeZone: "Asia/Taipei",
		region: getFunctionsRegion(),
		serviceAccount: TEARDOWN_SA,
		retryCount: 1,
	},
	async () => {
		logger.warn("scheduledTeardown firing — taking FamilyDay GreenWorld offline");
		const results = await runTeardown(false);
		const failed = results.filter((r) => !r.ok);
		if (failed.length) {
			logger.error("scheduledTeardown completed with failures", { failed });
		} else {
			logger.warn("scheduledTeardown completed — all services taken offline", { results });
		}
	},
);
