# 前後端 API 整合驗證清單（精簡版）

> 適用範圍：[`familyday-api-contract/api-v0.1.md`](../../familyday-api-contract/api-v0.1.md)  
> 目的：用最短流程驗證「前端 UI + API + 後端資料層」是否可用。  
> 詳細補充：  
> - Mock 流程：[`api-mock-testing.md`](./api-mock-testing.md)  
> - 歷史執行紀錄與 Go/No-Go：[`api-integration-history.md`](./api-integration-history.md)

---

## 0) 測試前準備（必做）

- `VITE_API_BASE` 已指向目標 API（本機常用 `/fdgw-emulator-api`）。
- 已清除瀏覽器 session / localStorage（避免前次狀態污染）。
- 若用 Firestore：已設定 `GOOGLE_APPLICATION_CREDENTIALS`、`GOOGLE_CLOUD_PROJECT`、`FDGW_USE_FIRESTORE=true`。
- `fdgw.project.json` 與 `familyday-backend/.firebaserc` 的專案 ID 一致。

參考：
- [`docs/setup/local-firestore-gcp.md`](../setup/local-firestore-gcp.md)
- [`docs/architecture/summary-backend.md`](../architecture/summary-backend.md)

---

## 1) 健康檢查

- `GET /api/v1/health` 回 200。
- `GET /api/v1/health/ready` 回 200。
- Console / Network 可看到可追蹤的請求與回應。

---

## 2) 報到流程

- `POST /api/v1/checkin` 正常資料成功。
- 缺欄位（`employeeId`/`name`/`partySize`）回 4xx。
- `GET /api/v1/checkin/status`：以 **curl／Network／驗證腳本**確認回應與 **`checkins`** 資料一致。**迄 2026-05-11** 玩家 SPA **未**將此端點綁進畫面（`fetchCheckinStatus` 僅 `src/api/`＋單元測試）；若未接 UI，勿以「畫面上狀態列」為唯一驗收依據。對照見 [`system-architecture.md`](../architecture/system-architecture.md) §8.3。

---

## 3) 登入與主畫面

- `POST /api/v1/auth/login` 可建立 session。
- `GET /api/v1/auth/me` 可回傳登入者。
- `GET /api/v1/me/dashboard` 回傳 `stages + progress`。
- `POST /api/v1/auth/logout` 後再呼叫需授權 API 應回 401。

---

## 4) 關卡流程

- `POST /api/v1/stations/verify`：`stageId` 與 `challengeId` 對應正確。
- `GET /api/v1/challenges/{challengeId}`：不回傳正解。
- `POST /api/v1/challenges/{challengeId}/attempts`：答對成功、答錯可重試且不亂序。

---

## 5) 輪次與領獎

- `POST /api/v1/me/playthrough/restart`：條件符合成功，不符合回 409。
- `POST /api/v1/me/reward/claim`：符合規則成功，不符合回 409。
- 若啟用 staff：`/staff/redeem/token`、`/staff/redeem/confirm` 正常且防重覆核銷。

---

## 6) 例外與風險場景

- 未登入呼叫需授權 API 回 401（不是 500）。
- 欄位格式錯誤回 4xx 且錯誤訊息可讀。
- 重要動作（報到、作答、領獎）可審計追蹤。
- 多分頁/多裝置不應造成進度覆蓋錯亂。

---

## 7) 執行結果

### 最新一次完整執行（2026-04-30）

- **執行日期：** 2026-04-30
- **環境（dev/stage）：** dev — Functions Emulator (port 5003) + in-memory roster
- **Seed 版本：** in-memory（`familyday-backend/src/state/*.ts`；舊紀錄或歷史筆記可能寫 **`functions/src/state`**）
- **涵蓋章節（1~6）：** 1、2、3、4、5、6（401 / 409 / CORS）
- **Pass / Fail / Blocked：** Pass 17、Fail 0、Blocked 1
- **證據：** CLI 驗證：`health/ready/login/me/checkin/status/dashboard/stations/verify/challenges/attempts/restart(409)/staff/redeem/admin/reports`；CORS allowlist 驗證（`evil.example.com` 無 ACAO）
- **結論：** **Go（dev in-memory）**；**Blocked（Firestore）** — `PERMISSION_DENIED` on `familyday-greenworld-dev`
- **備註：** Firestore IAM 授權未完成（`firebase login:list` 顯示 No authorized accounts）；IAM 到位後需重跑 `npm run verify:firestore`

### Firestore 待驗狀態（截至 2026-05-10）

- **環境：** dev + `FDGW_USE_FIRESTORE=true`
- **涵蓋章節：** 0（前置）、3、5（Firestore 真切換）
- **Pass / Fail / Blocked：** Pass 0、Fail 0、Blocked 1
- **結論：** **Conditional Go** — 流程腳本就緒，IAM 授權後可直接重跑
- **備註：** 需先取得目標 Firebase 專案 `Cloud Datastore User` 角色，再執行 `npm run verify:firestore`

### 執行紀錄 2026-05-10（Firestore 憑證驗證）

- **執行日期：** 2026-05-10
- **環境（dev/stage）：** dev — Cloud Firestore (`FDGW_USE_FIRESTORE=true`, project: `rare-lattice-495009-i9`)
- **Seed 版本：** `familyday-backend/scripts/verify-firestore-flow.mjs`
- **涵蓋章節（1~6）：** 0（前置憑證檢查）
- **Pass / Fail / Blocked：** Pass 0、Fail 0、Blocked 1
- **證據：** `node ./scripts/verify-firestore-flow.mjs` → `FAIL firestore verification: GOOGLE_APPLICATION_CREDENTIALS is not set.`；Firebase CLI 已登入（`jhangjie999@gmail.com`）；gcloud CLI 未安裝，ADC 憑證檔（`%APPDATA%\gcloud\application_default_credentials.json`）不存在
- **結論：** **Blocked** — IAM 角色已取得，但本機尚未設定 GCP 憑證
- **備註：** 解除方式（擇一）：① 安裝 gcloud → `gcloud auth application-default login`；② Firebase Console 下載 SA JSON → 設定 `GOOGLE_APPLICATION_CREDENTIALS=<path>` → 重跑 `npm run verify:firestore`

### 下次執行模板

- 執行日期：
- 環境（dev/stage）：
- Seed 版本：
- 涵蓋章節（1~6）：
- Pass / Fail / Blocked：
- 證據（截圖 / HAR / log / PR）：
- 結論（Go / Conditional Go / No-Go）：
- 備註：

---

## 8) 建議順序（快速）

1. `health` / `ready`
2. `checkin` / `checkin/status`
3. `auth/login` / `auth/me` / `me/dashboard`
4. `stations/verify` / `attempts`
5. `playthrough/restart` / `reward/claim`
6. 401 / 409 / JWT 過期 / 重播等異常
