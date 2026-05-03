# GCP 服務帳戶與本機 Firestore 驗證

**金鑰 JSON 不可提交進 Git。** 請放在倉庫**外**或已列入 `.gitignore` 的目錄（範例檔名：`familyday-greenworld-dev-sa.json`；實際路徑依你的機器調整）。

## 環境變數

| 變數／參數 | 用途 |
|------------|------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 指向上述 JSON 的**絕對路徑**；`firebase-admin` 與 `npm run verify:firestore` 會讀取 |
| `GOOGLE_CLOUD_PROJECT` | 例如 `familyday-greenworld-dev`（`verify` 腳本與 `cloud-firestore-dev.ps1` 會設定） |
| `FDGW_USE_FIRESTORE` | 設為 `true` 時走 Firestore 資料層（見 [`summary-backend.md`](../architecture/summary-backend.md) §「本機服務帳戶」） |

## PowerShell（推薦）

於 `functions/` 目錄執行（將路徑改成你的金鑰檔）：

```powershell
.\scripts\cloud-firestore-dev.ps1 -Mode verify -CredentialPath "C:\path\to\your-sa.json"
```

`serve`／`all` 模式同樣支援 `-CredentialPath`；與整合測試流程並讀 [`api-integration-checklist.md`](../testing/api-integration-checklist.md) §0 與 [`summary-backend.md`](../architecture/summary-backend.md)。

## 寫入測試名冊（Firestore `roster`）

於 `functions/` 設定 `GOOGLE_APPLICATION_CREDENTIALS` 後執行 `npm run seed:roster`。欄位與 Console 測資一致：`eventId`=`familyday-2026`、`source`=`manual`、`updatedAt`=執行當下 ISO 時間、`partySizePlanned`=2；員編預設 **`1141043` 起連號**（預設 10 筆至 `1141052`）。**英文姓名預設不重複**（`1141043` 為 `Bob` 以利 `verify:firestore`，其餘為 Alice、Carol、David… 等內建名單；筆數超過名單長度時改為 `RosterSeed0001` 形式）。可選環境變數：`SEED_COUNT`、`SEED_EMPLOYEE_ID_START`；若需字首員編＋`SeedTester0001` 命名可設 **`SEED_ID_PREFIX`**。實際寫入的 GCP 專案以金鑰 JSON 內 **`project_id`** 為準。

## 遠端 Firestore Rules／索引

根目錄已納入 `firestore.rules`、`firestore.indexes.json`，並於 `firebase.json` 註冊。在倉庫根目錄、已 `firebase login` 且 `.firebaserc` 指向目標專案後執行 `firebase deploy --only firestore`（或 `:rules` / `:indexes`）。設計說明見 [`firestore-schema-v1.md`](../architecture/firestore-schema-v1.md) **§1.2**。

## 清空應用集合後重灌名冊（危險）

**僅限你確認過的 dev 專案。** 於 `functions/` 設定 `GOOGLE_APPLICATION_CREDENTIALS`，且 **`FDGW_EXPECT_PROJECT_ID` 必須與金鑰 JSON 內 `project_id` 完全一致**（避免誤刪別專案），再設 `FDGW_PURGE_CONFIRM=YES`，執行 `npm run purge:firestore-app`（預設刪除 `redeem_tokens`、`redeem_records`、`player_progress`、`checkins`、`roster` 內全部文件）。完成後再 `npm run seed:roster`；報到／闖關資料請用 API 或測試流程產生。
