# Cloud Functions（`api`）首次正式部署 — 問題處理報告

> **專案：** 瑞軒 2026 家庭日綠世界 · `familyday-backend`  
> **Firebase / GCP 專案 ID：** `rare-lattice-495009-i9`  
> **日期：** 2026-05-11  
> **範圍：** Gen2 HTTPS Function `api`（Express）+ Firestore rules/indexes 部署過程中遭遇的阻塞與對策；**不含**前端 Hosting 上架。

---

## 1. 背景與目標

- 目標：以 **`firebase deploy --only functions:api,firestore`**（或分拆）將後端 API 上架至 Firebase/Google Cloud。  
- 執行環境：Windows，`familyday-backend/` 目錄，`npx firebase-tools`（本機 **`firebase` 未加入 PATH** 時之替代）。  
- 執行期需 **連線至真實 Firestore**：透過 **`familyday-backend/.env.rare-lattice-495009-i9`** 設定 **`FDGW_USE_FIRESTORE=true`**（詳見 §4）。

---

## 2. 問題與處置摘要（時序）

| # | 現象 | 根因（精簡） | 處置 |
|---|------|----------------|------|
| A | **Firebase 主控台看不到**與 GCP 相同的 Firestore／專案空空 | 僅在 GCP 建專案或未把 Firebase 綁到現有 GCP；另曾與 **錯誤專案 ID**（見 B）混淆 | 於 Firebase 選 **「將 Firebase 加到現有 Google Cloud 專案」**，指定 **`rare-lattice-495009-i9`**；之後以網址 **`/project/<專案ID>/`** 對照 |
| B | 兩組 **顯示名稱**類似但 **專案 ID 不同** | **`familyday-greenworld-dev-906ec`**（Firebase 新建）≠ **`rare-lattice-495009-i9`**（資料與 `.firebaserc`） | 以 **`rare-lattice-495009-i9`** 為準；誤建專案可於 **專案設定** 刪除（勿刪錯 ID） |
| C | **Cloud Build** 失敗、**Step 0 fetch** 無 log | 建置身分 **`…-compute@developer.gserviceaccount.com`** 缺 **寫入 Logging**（`logging.logEntries.create`） | 對該 **預設 Compute 服務帳戶**：**編輯**既有列 → **新增**角色 **`Logs Writer`（`roles/logging.logWriter`）**；**保留**原 **`Editor`**，**勿**以 Logs Writer 取代 Editor |
| D | **容器啟動失敗**：未於 **`PORT=8080`** 監聽 | **`src/config/fdgwProject.ts`** 的 **`repoRoot()`** 多算一層，`loadFdgwProject()` 在 Functions 封包內讀 **不存在的** `fdgw.project.json`，模組載入期拋錯 | 將 **`repoRoot()`** 改為自編譯 **`lib/config`** 起 **上兩層**（`familyday-backend` 根），與 **`scripts/read-fdgw-project.mjs`** 一致；封包內使用 **`familyday-backend/fdgw.project.json`** |
| E | **`GET /api/v1/health` 回 403**（Cloud Run / `*.run.app`） | Gen2 預設對外 **需 IAM 授權**；未設 **公開 Invoker** | 於 **`src/index.ts`** 的 **`onRequest({…})`** 增加 **`invoker: "public"`**（或於 GCP 對 Cloud Run 綁定 **`allUsers` → `roles/run.invoker`**，二擇一／以程式設定較可複審） |
| F | **`firebase deploy` 結束為非 0**、提示 **artifact cleanup policy** | Firebase CLI 期望為 Artifact Registry 設定映像清理規則 | 可於部署時加 **`--force`** 讓 CLI 自動設定 cleanup policy，或事後執行官方提示的 **`firebase functions:artifacts:setpolicy`** |

---

## 3. 技術參考連結

- Cloud Build／建置服務帳戶：**[Cloud Functions 疑難排解 · Build service account](https://cloud.google.com/functions/docs/troubleshooting#build-service-account)**  
- Cloud Run 容器未監聽：**[Cloud Run troubleshooting · container failed to start](https://cloud.google.com/run/docs/troubleshooting#container-failed-to-start)**  
- Gen2 環境變數（`.env.<專案ID>`）：**[Configure your environment (2nd gen)](https://firebase.google.com/docs/functions/config-env?gen=2nd)**  

---

## 4. 部署後檢查清單（建議）

1. **健康檢查：** `GET {API_ORIGIN}/api/v1/health` 應 **HTTP 200**、`{"ok":true,…}`。  
   **`API_ORIGIN`** 以 **`firebase deploy`** 輸出之 **Function URL** 為準（常為 **`https://*.a.run.app`**，實際 hostname 以控制台／輸出為準）。  
2. **前端：** 建置時設定 **`VITE_API_BASE`** = 上述 **origin**（無尾隨 **`/`**）。  
3. **Firestore：** 確認 Functions 執行環境 **`FDGW_USE_FIRESTORE=true`**（本專案由 **`.env.<專案ID>`** 隨 deploy 帶入）。  
4. **機密：** **`FDGW_SESSION_SECRET`** 勿提交至 Git；請於 **Secret Manager**／控制台另行設定。  
5. **金鑰：** GCP 服務帳戶 JSON **不可**入庫與外洩；遺失或誤分享應 **輪替金鑰**。

---

## 5. 相關程式變更（本報告撰寫時之閉環）

| 檔案 | 變更重點 |
|------|-----------|
| [`familyday-backend/src/config/fdgwProject.ts`](../../familyday-backend/src/config/fdgwProject.ts) | `repoRoot()` 對齊 Functions 封包根目錄 |
| [`familyday-backend/src/index.ts`](../../familyday-backend/src/index.ts) | `onRequest` 選項 **`invoker: "public"`** |
| [`familyday-backend/.env.rare-lattice-495009-i9`](../../familyday-backend/.env.rare-lattice-495009-i9) | **`FDGW_USE_FIRESTORE=true`**（隨 CLI 載入；**勿**寫入機密） |
| [`familyday-backend/.gitignore`](../../familyday-backend/.gitignore) | 將上列 `.env.<專案ID>` 設為可追蹤之例外（仍避免把含 secret 的 `.env.*` 提交） |

---

## 6. 復盤要點（給下一次活動或新專案）

- **專案 ID** 以 **GCP「專案編號」字串**為準，勿只看顯示名稱。  
- **IAM：** 在 **既有主體上「新增角色」**，少用「授予存取權」誤加新主體；**寬角色（Editor）上疊加細角色**時，**勿誤刪**原角色。  
- **路徑：** Functions 上傳目錄為 **`familyday-backend`** 單根時，**不得**假設上層 monorepo 目錄存在；設定檔須落在封包內或可預測路徑。  
- **公開 HTTP API：** Gen2 務必處理 **Invoker**（程式或 IAM），否則瀏覽器會得 **403**。  

---

**文件版本：** v1.0 · 2026-05-11  
