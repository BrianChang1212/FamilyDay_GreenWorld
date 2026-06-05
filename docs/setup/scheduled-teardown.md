# 一次性自動下架（2026-07-17 23:00）

活動結束後自動把 FamilyDay GreenWorld **對外關閉**，全雲端執行、不需本機。**資料保留**（不動 Firestore）。

## 規格

| 項目 | 值 |
|------|----|
| 函式 | `scheduledTeardown`（Firebase Functions v2 `onSchedule`，`us-central1`）|
| 觸發 | cron `0 23 17 7 *`、**Asia/Taipei** → **2026-07-17 23:00** |
| 執行身分 | 專用最小權限 SA **`fdgw-teardown@familyday-greenworld.iam.gserviceaccount.com`** |
| SA 角色 | `firebasehosting.admin` / `run.admin` / `cloudscheduler.admin`（剛好對應三動作）|

## 觸發時做的三件事

| 動作 | 對象 | 效果 |
|------|------|------|
| Hosting `SITE_DISABLE` release | `familyday-greenworld.web.app` | 前端顯示停用頁 |
| 移除 `allUsers` 的 `run.invoker` | Cloud Run `api`、`apiloadtest` | API 全部 403 |
| 暫停 Scheduler job | `firebase-schedule-dumpCheckinsDaily-us-central1` | 停每日 dump 信 |

> cron `0 23 17 7 *` 表每年 7/17 23:00；本活動僅 2026 一次，重複觸發為冪等（已關再關仍是關）。

## 程式碼

- `src/scheduled/scheduledTeardown.ts` — onSchedule 包裝（指定 `serviceAccount: fdgw-teardown`）
- `src/scheduled/teardownActions.ts` — `runTeardown(dryRun)`（三動作 + `dryRun` 只印計畫不呼叫 API）、純函式 `withoutPublicInvoker()`
- 測試 `test/scheduled/teardownActions.test.ts`（invoker 轉換 + dry-run 計畫）

## 一次性建置（已完成 2026-06-05）

1. 建專用 SA（用 `.secrets/` 的 SA，可建 SA 但**無法改專案 IAM**）：
   ```
   POST iam.googleapis.com/v1/projects/familyday-greenworld/serviceAccounts {accountId: fdgw-teardown}
   ```
2. **由專案 Owner 在 Console 授權**（`.secrets/` SA 無此權限）：
   - IAM → 授予 `fdgw-teardown@…` 三角色：Firebase Hosting Admin / Cloud Run Admin / Cloud Scheduler Admin
   - 部署者 `familyday.amtran@gmail.com` 對該 SA 的 actAs（本專案中其為 Owner，已隱含涵蓋）
3. 部署：`npx firebase-tools deploy --only functions:scheduledTeardown --project=production`（自動建立 Cloud Scheduler job）

## 驗證（dry-run / 安全實測）

- 本地 dry-run（不變更）：
  ```
  node -e "require('./lib/scheduled/teardownActions.js').runTeardown(true).then(r=>console.log(r))"
  ```
- 安全實測（已做）：模擬 `fdgw-teardown` 身分，對 **apiloadtest** 移除→還原 invoker、對 dump 排程 pause→resume，皆 200 並復原；正式 `api` 與 hosting 未動。

## 復原（要重新上架時）

執行 [`scripts/restore-production.ps1`](../../scripts/restore-production.ps1)：重佈 functions（程式碼 `invoker:"public"` → 還原公開存取、重啟 dump 排程）+ hosting（新 DEPLOY release 覆蓋 SITE_DISABLE）。Firestore 資料未受影響。

## 取消 / 改期

- **改期**：改 `scheduledTeardown.ts` 的 `schedule` 後重佈。
- **取消自動下架**：刪函式 `npx firebase-tools functions:delete scheduledTeardown --project=production`（或暫停其 Cloud Scheduler job）。
