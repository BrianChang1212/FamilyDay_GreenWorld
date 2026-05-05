# GCP 服務帳戶與本機 Firestore 驗證

**金鑰 JSON 不可提交進 Git。** 請放在倉庫**外**或已列入 `.gitignore` 的目錄（範例檔名：`your-project-sa.json`；實際路徑依你的機器調整）。

**專案常數（Firebase 專案 ID、區域、emulator 埠、`eventId`）**請編輯倉庫根目錄 **[`fdgw.project.json`](../../fdgw.project.json)**，並維持與 [`.firebaserc`](../../.firebaserc) 的 `default` 專案一致。

## 最短路徑（Windows：前端 + API + 雲端 Firestore）

倉庫根 **[`README.md`](../../README.md)** 的 **「Windows：一鍵啟動」**：執行 **`scripts/dev-oneclick.ps1`**（含 `-CredentialPath` 或 `GOOGLE_APPLICATION_CREDENTIALS`）。會背景啟動 **`cloud-firestore-dev.ps1 -FunctionsOnly`**（僅 Functions emulator，連**雲端** Firestore）、再啟動 Vite；無需手動分開開兩個終端機。

## 環境變數

| 變數／參數 | 用途 |
|------------|------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 指向上述 JSON 的**絕對路徑**；`firebase-admin` 與 `npm run verify:firestore` 會讀取 |
| `GOOGLE_CLOUD_PROJECT` | 目標 GCP／Firebase 專案 ID（未設定時，`cloud-firestore-dev.ps1` 使用 `fdgw.project.json` 的 `firebaseProjectId`） |
| `FDGW_USE_FIRESTORE` | 設為 `true` 時走 Firestore 資料層（見 [`summary-backend.md`](../architecture/summary-backend.md) §「本機服務帳戶」） |

## PowerShell（推薦）

於 `functions/` 目錄執行（將路徑改成你的金鑰檔）：

```powershell
.\scripts\cloud-firestore-dev.ps1 -Mode verify -CredentialPath "C:\path\to\your-sa.json"
```

`serve`／`all` 模式同樣支援 `-CredentialPath`。若本機已用 **Vite** 跑前端，建議 **`serve` 時加上 `-FunctionsOnly`**（等同 `npm run serve:functions`），只起 Functions emulator、**不起** Hosting（5000），避免與靜態預覽埠衝突。與整合測試流程並讀 [`api-integration-checklist.md`](../testing/api-integration-checklist.md) §0 與 [`summary-backend.md`](../architecture/summary-backend.md)。

## 寫入測試名冊（Firestore `roster`）

於 `functions/` 設定 `GOOGLE_APPLICATION_CREDENTIALS` 後執行 `npm run seed:roster`。`eventId`、`partySizePlanned`、預設起迄員編與筆數上限以 **[`fdgw.project.json`](../../fdgw.project.json)** 的 **`eventId`** 與 **`seed`** 區塊為準（可用 `FDGW_EVENT_ID`、`SEED_COUNT`、`SEED_EMPLOYEE_ID_START` 等環境變數覆寫）。欄位型態：`source`=`manual`、`updatedAt`=執行當下 ISO 時間。**英文姓名預設不重複**（首位多為 `Bob` 以利 `verify:firestore`，其餘為內建名單；筆數超過名單長度時改為 `RosterSeed0001` 形式）。若需字首員編＋`SeedTester0001` 命名可設 **`SEED_ID_PREFIX`**。實際寫入的 GCP 專案以金鑰 JSON 內 **`project_id`** 為準。

## 遠端 Firestore Rules／索引

根目錄已納入 `firestore.rules`、`firestore.indexes.json`，並於 `firebase.json` 註冊。在倉庫根目錄、已 `firebase login` 且 `.firebaserc` 指向目標專案後執行 `firebase deploy --only firestore`（或 `:rules` / `:indexes`）。設計說明見 [`firestore-schema-v1.md`](../architecture/firestore-schema-v1.md) **§1.2**。

## 清空應用集合後重灌名冊（危險）

**僅限你確認過的 dev 專案。** 於 `functions/` 設定 `GOOGLE_APPLICATION_CREDENTIALS`，且 **`FDGW_EXPECT_PROJECT_ID` 必須與金鑰 JSON 內 `project_id` 完全一致**（避免誤刪別專案），再設 `FDGW_PURGE_CONFIRM=YES`，執行 `npm run purge:firestore-app`（預設刪除 `redeem_tokens`、`redeem_records`、`player_progress`、`checkins`、`roster` 內全部文件）。完成後再 `npm run seed:roster`；報到／闖關資料請用 API 或測試流程產生。
