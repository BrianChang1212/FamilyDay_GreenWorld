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
- 可覆寫：`FDGW_EVENT_ID`、`SEED_COUNT`、`SEED_EMPLOYEE_ID_START`

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
