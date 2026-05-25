# GCP 服務帳戶與本機 Firestore（第二層精簡版）

## 快速版（先做這 4 步）

1. 準備服務帳戶金鑰 JSON（不可提交 Git）。
2. 確認 [`fdgw.project.json`](../../fdgw.project.json) 與 [`familyday-backend/.firebaserc`](../../familyday-backend/.firebaserc) 專案 ID 一致。
3. Windows 一鍵啟動：執行倉庫根 `scripts/dev-oneclick.ps1`（帶 `-CredentialPath` 或先設 `GOOGLE_APPLICATION_CREDENTIALS`）。
4. 驗證 API 與 UI：依 [`docs/testing/api-integration-checklist.md`](../testing/api-integration-checklist.md) 跑主清單。

---

## 快速驗證命令（PowerShell）

在 `familyday-backend/`：

```powershell
.\scripts\cloud-firestore-dev.ps1 -Mode verify -CredentialPath "C:\path\to\your-sa.json"
```

若只需要 API（不啟 Hosting 5000）：

```powershell
.\scripts\cloud-firestore-dev.ps1 -Mode serve -FunctionsOnly -CredentialPath "C:\path\to\your-sa.json"
```

---

## 進階版（需要時再看）

### A) 核心環境變數

| 變數／參數 | 用途 |
|------------|------|
| `GOOGLE_APPLICATION_CREDENTIALS` | 金鑰 JSON 絕對路徑（`firebase-admin`、verify 會讀） |
| `GOOGLE_CLOUD_PROJECT` | 目標專案 ID（未設時由 `fdgw.project.json` 推導） |
| `FDGW_USE_FIRESTORE` | `true` 時走 Firestore 資料層 |

### B) 寫入測試名冊（roster）

在 `familyday-backend/` 設定好 `GOOGLE_APPLICATION_CREDENTIALS` 後：

```bash
npm run seed:roster
```

預設值來源：
- `eventId`、seed 參數：`fdgw.project.json`
- 英文字名：**前 94 筆槽位**在 [`familyday-backend/scripts/seed-roster-test-rows.mjs`](../../familyday-backend/scripts/seed-roster-test-rows.mjs)，**槽位 95～500（與 `seed.maxCount` 上限對齊）**讀 sibling [`familyday-backend/scripts/seed-roster-extra-first-names.json`](../../familyday-backend/scripts/seed-roster-extra-first-names.json)。
- **英文名不重複（分段種子）：** `SEED_NAME_SLOT_ANCHOR`（預設等同 `seed.defaultEmployeeIdStart`）決定「工號減去錨點＝名字槽位」。分段跑（先 1141043–52 再 1141053+）時勿改錨點，即可與單次連續種子得到相同 `1141043→Bob、1141053→Kate…` 對應。
- 可覆寫：`FDGW_EVENT_ID`、`SEED_COUNT`、`SEED_EMPLOYEE_ID_START`、`SEED_NAME_SLOT_ANCHOR`

### C) 部署 Firestore Rules／索引

在倉庫根且已 `firebase login`：

```bash
firebase deploy --only firestore
```

（或拆成 `firestore:rules` / `firestore:indexes`）

### D) 危險操作：清空應用集合後重灌

僅限 dev 專案，且先確認：
- `FDGW_EXPECT_PROJECT_ID` = 金鑰內 `project_id`
- `FDGW_PURGE_CONFIRM=YES`

再於 `familyday-backend/` 執行：

```bash
npm run purge:firestore-app
npm run seed:roster
```

### E) 對「正式」環境（`familyday-greenworld`）執行 admin CLI

> **重要前提：** `fdgw.project.json::firebaseProjectId` 目前指向 **staging**（`rare-lattice-495009-i9`）。對 production 跑任何 admin CLI 必須**用環境變數覆寫**，否則 SA 雖然合法但會對 staging 專案發 request → `7 PERMISSION_DENIED`。

PowerShell 範本（**請替換 `<production-sa.json>` 為實際路徑，金鑰絕對路徑勿入 docs/Git**）：

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "<production-sa.json>"
$env:FDGW_FIREBASE_PROJECT_ID = "familyday-greenworld"   # 覆寫 fdgw.project.json 的 staging 預設
$env:GOOGLE_CLOUD_PROJECT = "familyday-greenworld"        # 雙保險
cd familyday-backend
```

**典型操作：以新名冊 dump 覆蓋現有 roster**

1. 把 xlsx 轉成 `ref_no_push/firestore-dumps/roster-YYYYMMDD-zh.json`（schema 對齊既有 dump：`{dumpedAt, projectId, databaseId, collection:"roster", count, docs:[{id, eventId, partySizePlanned, employeeId, source:"import", name, updatedAt}]}`，`id` = `${eventId}_${employeeId}`）。
2. （可選但建議）盤點 pre-purge 計數：用一個臨時 `_tmp-count-all.mjs` 對 5 個集合做 `.count().get()`，紀錄基準。
3. Purge 五個集合：
   ```powershell
   $env:FDGW_PURGE_CONFIRM = "YES"
   $env:FDGW_EXPECT_PROJECT_ID = "familyday-greenworld"
   $env:FDGW_PURGE_COLLECTIONS = "redeem_tokens,redeem_records,player_progress,checkins,roster"
   node ./scripts/purge-firestore-app-data.mjs
   ```
4. Import 新 roster：
   ```powershell
   node ./scripts/import-roster-dump.mjs ..\ref_no_push\firestore-dumps\roster-YYYYMMDD-zh.json
   ```
5. 驗證：再跑一次 pre-purge 的計數腳本，確認 `roster=<期望數>`、其他集合=0。
6. 同步：用 `npm run verify:firestore` 對正式 Cloud Functions 端點再 smoke 一次（同樣需要設好上面三條 env）。

**為什麼需要 `FDGW_FIREBASE_PROJECT_ID` 覆寫：** `scripts/read-fdgw-project.mjs::getFirebaseProjectId()` 預設讀 `fdgw.project.json`（staging），所有 admin script 都會傳這個 project ID 給 firebase-admin。SA 對非自己 project 的 Firestore 沒權限 → `PERMISSION_DENIED`。

**為什麼 5 個 script 不再有「default」字串 NOT_FOUND 問題：** commit `05c667f` 後，scripts 對齊了 `src/utils/store.ts::getDb()` 的 db ID 解析（空 / `default` / `(default)` → `getFirestore()` 不帶參數）。production 專案的 Firestore 預設資料庫沒有名字，必須這樣呼叫；staging 因為有名為 "default" 的 db 一直沒事。

---

## 安全注意（必讀）

- 金鑰 JSON 不可提交到 Git，也不要貼到聊天或公開文件。
- 實際寫入專案以金鑰 JSON 內 `project_id` 為準。
- 若出現 `PERMISSION_DENIED`，先檢查 IAM 與專案 ID 是否一致。

---

## 相關文件

- 整合主清單：[`docs/testing/api-integration-checklist.md`](../testing/api-integration-checklist.md)
- Mock 測試：[`docs/testing/api-mock-testing.md`](../testing/api-mock-testing.md)
- 歷史紀錄：[`docs/testing/api-integration-history.md`](../testing/api-integration-history.md)
- 後端架構：[`docs/architecture/summary-backend.md`](../architecture/summary-backend.md)
