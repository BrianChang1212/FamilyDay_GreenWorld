# 前後端 API 整合驗證清單（Checklist）

> 適用範圍：`docs/specs/api-v0.1.md`（目前修訂至 v0.1.13）  
> 目的：用「前端實際操作」驗證 API 契約、錯誤處理與資料一致性。

---

## Mock 測試範圍註記

- 本清單含「正式後端安全驗證項」與「mock smoke 項」兩類。
- `source/mock/server.js` 目前**不涵蓋**完整 session/JWT 安全語意（如 logout 後 401、JWT 過期/重播防護）。
- 若使用 mock 驗證，請將第 3、4、6 章的安全驗證項標記為「正式後端待驗」。

---

## 0) 測試前準備

- 前端使用測試環境（非正式環境）
- `VITE_API_BASE` 已指向測試 API（例如 `/api/v1`）
- 已載入固定測資（seed）且記錄 seed 版本
- 已清空上次測試 session / local storage（避免汙染）
- 測試紀錄模板已建立（案例 ID、預期、實際、截圖、API 回應）
- **Firestore／Admin 驗證（`functions`）**：金鑰 JSON **勿進版控**；設定 `GOOGLE_APPLICATION_CREDENTIALS` 為金鑰**絕對路徑**，並設 `FDGW_USE_FIRESTORE=true`、`GOOGLE_CLOUD_PROJECT=familyday-greenworld-dev`（或目標專案）。本機慣例範例路徑：`D:\Brian\secrets\firebase\familyday-greenworld-dev-sa.json`。可改用 `functions/scripts/cloud-firestore-dev.ps1 -CredentialPath "..."` 一次帶入；說明見根目錄 [`README.md`](../../README.md)「GCP 服務帳戶」小節與 [`summary-backend.md`](../architecture/summary-backend.md) §「本機服務帳戶」。

---

## 1) 驗證環境與安全基線

- `GET /api/v1/health` 可回應（200）
- `GET /api/v1/health/ready` 可回應（200）
- 測試環境 API 可正常回傳 JSON
- 有涉及個資或登入流程時，已確認使用 HTTPS 測試
- Network / Console / Server log 可追蹤請求（含 request id 或等價追蹤資訊）

---

## 2) 入口與報到流程

### 2.1 入口驗證（選用）

- `POST /api/v1/entry/verify` 正常 token 可通過
- 無效/過期 token 回應錯誤碼（預期 4xx）

### 2.2 報到

- `POST /api/v1/checkin` 正常資料可成功
- 缺欄位（`employeeId` / `name` / `partySize`）回 4xx
- `GET /api/v1/checkin/status` 與報到結果一致
- UI 顯示與 API 狀態一致（成功頁/錯誤提示/按鈕狀態）

---

## 3) 闖關登入與主畫面

- `POST /api/v1/auth/login` 正常帳號可建立 session
- `POST /api/v1/auth/logout` 後需授權 API 應回 401
- `GET /api/v1/auth/me` 可回傳登入者摘要
- `GET /api/v1/me/dashboard` 可回傳 `stages` + `progress`
- `POST /api/v1/me/reward/claim` 於通關且符合輪次規則時遞增 `rewardRedeemCount`；否則 409
- `progress.rewardRedeemCount` / `fullClearCount` 在前端呈現符合預期

---

## 4) 關卡到站與作答

### 4.1 站點 QR 驗證

- `POST /api/v1/stations/verify` 正常 QR JWT 可通過
- 過期 JWT（`exp`）被拒絕
- 重播 JWT（`jti`）被拒絕

### 4.2 題目與作答

- `GET /api/v1/challenges/{challengeId}` 不回傳正解
- `POST /api/v1/challenges/{challengeId}/attempts` 答對回正確結果
- 答錯可重試，且符合限流規則
- 連續快速提交不會造成狀態錯亂

---

## 5) 輪次與領獎流程

### 5.1 再玩一輪

- `POST /api/v1/me/playthrough/restart` 在允許條件下成功
- 不允許條件（例如未通關）回 409
- `fullClearCount` 於每次「再玩一輪」遞增；`remainingRounds` 可為 `null`（闖關不限次）

### 5.2 櫃台領獎（若啟用）

- `POST /api/v1/staff/redeem/token` 可取得短期 token
- `POST /api/v1/staff/redeem/confirm` 可寫入核銷結果
- 重複核銷有防呆（不可重複成功）
- 權限不足帳號不可呼叫 staff API

---

## 6) 例外與風險場景

- 未登入呼叫需授權 API 回 401（非 200/500）
- 欄位格式錯誤回 4xx（含可讀錯誤訊息）
- 模擬網路中斷重送後，資料不重覆入庫
- 同工號多分頁/多裝置同時操作，進度不互相覆蓋錯亂
- 重要行為（報到、作答、領獎）可被審計追蹤

---

## 7) 測試結果記錄模板

每一個案例至少記錄：

- 案例 ID：
- API：
- 前置資料（seed / 帳號）：
- 操作步驟：
- 預期結果：
- 實際結果：
- 證據（截圖 / HAR / 回應 JSON）：
- 結論：Pass / Fail
- 備註：

---

## 7.1) 最新執行紀錄（可直接填寫）

> 填寫規則：每次整合測試執行後新增一列；證據可填 PR、測試報告、截圖或 HAR 路徑。

| 執行日期 | 環境 | Seed 版本 | 範圍（章節） | Pass | Fail | Blocked | 證據連結 | 執行者 | 備註 |
|----------|------|-----------|--------------|------|------|---------|----------|--------|------|
| 2026-04-30 | dev (Functions + Firestore verification script) | ADC (`C:\Users\Brian Chang\AppData\Roaming\gcloud\application_default_credentials.json`) | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `FDGW_USE_FIRESTORE=true` + `GOOGLE_CLOUD_PROJECT=familyday-greenworld-dev` + `GOOGLE_APPLICATION_CREDENTIALS=...` 後執行 `npm run verify:firestore`：`7 PERMISSION_DENIED: Permission denied on resource project familyday-greenworld-dev.`；`npx firebase login:list` 顯示 `No authorized accounts` | Codex | Blocked 仍存在：需先完成目標專案 IAM 授權並完成 Firebase CLI/GCP 身份對齊 |
| 2026-04-30 | dev (Functions + Firestore verification script) | ADC (`application_default_credentials.json`) | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `npm run verify:firestore`：先缺 Project ID，補 `GOOGLE_CLOUD_PROJECT` 後回 `PERMISSION_DENIED` | Codex | Blocked: Firestore IAM permission pending（已建憑證，待專案授權） |
| 2026-04-30 | dev (Functions + Firestore verification script) | `functions/scripts/verify-firestore-flow.mjs` | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `npm run verify:firestore` -> 缺 `FDGW_USE_FIRESTORE`；啟用後缺 `GOOGLE_APPLICATION_CREDENTIALS` | Codex | Blocked: Firestore IAM permission pending（流程已建置，可直接重跑） |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1, 6(CORS allowlist) | 3 | 0 | 0 | CORS 驗證：allowlist `netlify` 回 `200 + ACAO`；非白名單 `evil.example.com` 回 `500` 且無 ACAO | Codex | CORS allowlist 已收斂；白名單含 localhost:5173/4173、Netlify、GitHub Pages |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1~5 + 6(401/409/CORS) | 17 | 0 | 1 | CLI：`health/ready/login/me/checkin/status/stations/challenges/attempts/dashboard/staff/admin` + 回歸 `source test/build`、`functions build` | Codex | 核心流程可用；**CORS allowlist 未收斂**（`Origin: https://evil.example.com` 仍回 `Access-Control-Allow-Origin`） |
| 2026-04-30 | dev (Functions Emulator) | in-memory roster (`functions/src/data/employees.ts`) | 1, 2.2, 3, 6(401 基本驗證) | 8 | 0 | 0 | CLI 驗證：`health/ready/login/me/checkin/status/dashboard` 皆 200，未登入 `auth/me` 為 401 | Codex | 第一階段僅驗 MVP 端點；stations/challenges/restart/staff/admin 待下一階段 |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1, 3, 4, 5, 6 | 13 | 0 | 0 | CLI 驗證：`stations/verify`、`challenges/*`、`restart(409)`、`staff/redeem/*`、`admin/reports/*` 皆符合預期 | Codex | 第二階段端點已落地（in-memory）；JWT 驗簽/Firestore 仍待下一階段 |
| <!-- YYYY-MM-DD --> | <!-- dev/stage --> | <!-- seed tag --> | <!-- 1~6 / 全部 --> | <!-- n --> | <!-- n --> | <!-- n --> | <!-- link/path --> | <!-- owner --> | <!-- note --> |

---

## 7.2) 當前結論（Go/No-Go）

- **Go（dev/stage）**：前端 + API + 後端（in-memory）整合流程可運作，核心路徑與 401/409/CORS 邊界已驗證。
- **Conditional Go（Firestore）**：Firestore 模式程式路徑與驗證腳本已就緒，但 IAM 未授權前不可視為 fully verified。
- **No-Go（正式對外）**：若 Firestore IAM 與最小安全基線（憑證、權限、環境變數）未完成，不可進入正式上架。
- **Blocked 標準用語**：`Firestore IAM permission pending`。

---

## 8) 建議執行順序（快速版）

1. 健康檢查（`health` / `ready`）
2. 報到流程（`checkin`）
3. 登入 + dashboard（`auth/login` + `me/dashboard`）
4. 站點 + 作答（`stations/verify` + `attempts`）
5. restart / redeem 邊界驗證
6. 401 / 409 / JWT 過期 / 重播等異常場景

---

## 9) Mock API 驗證流程（整合）

> 目的：在後端尚未完整上線前，先驗證前端 API 串接邏輯、錯誤處理與畫面呈現。
> 範圍：涵蓋 `docs/specs/api-v0.1.md` 目前列出的全站 API（以 mock server
> 對應）。

### 9.1 啟動方式

#### 啟動 Mock API

在 `source/` 目錄執行：

```bash
npm run mock:api
```

預設埠號：`8787`
可透過環境變數調整：`MOCK_API_PORT=9000 npm run mock:api`
PowerShell 寫法：`$env:MOCK_API_PORT=9000; npm run mock:api`

#### 設定前端 API Base

於 `source/.env.local` 設定：

```env
VITE_API_BASE=http://localhost:8787
```

> 注意：修改 `.env.local` 後，需重新啟動 `npm run dev`。

#### 啟動前端

在 `source/` 目錄執行：

```bash
npm run dev
```

### 9.2 驗證案例（`/finish/claimed`）

> 驗證路徑：先走到完成頁，再進入領取成功頁（`/finish/claimed`）。

| 案例 | 請求範例 | 預期結果 |
|------|----------|----------|
| 正常（ok） | `/api/v1/me/dashboard` | 顯示 2/3 已領取（預設） |
| 缺欄位（missing） | `/api/v1/me/dashboard?scenario=missing` | 前端使用預設值，不應崩潰 |
| 非法值（invalid） | `/api/v1/me/dashboard?scenario=invalid` | 前端應做 clamp（不超出合理範圍） |
| 全領取（full） | `/api/v1/me/dashboard?scenario=full` | 顯示 3/3 已領取 |
| 空資料（empty） | `/api/v1/me/dashboard?scenario=empty` | 顯示 0/3 已領取 |
| 伺服器錯誤（error） | `/api/v1/me/dashboard?scenario=error` | 顯示 API 錯誤訊息或降級呈現 |

### 9.3 快速切換 scenario

目前前端正式呼叫路徑為：

`GET {VITE_API_BASE}/api/v1/me/dashboard`

若要快速切換 scenario（不改程式碼）可暫時使用代理或手動測 API：

```bash
curl "http://localhost:8787/api/v1/me/dashboard?scenario=ok"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=missing"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=invalid"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=error"
```

### 9.4 驗證完成標準

- `npm run test` 通過
- `npm run build` 通過
- 在設定 `VITE_API_BASE` 後，`/finish/claimed` 可讀取 Mock API 並正常呈現
- 針對錯誤與非法資料，畫面不崩潰且有可理解狀態
- `npm run test:api:all` 全部 PASS（全站 API smoke test）

#### 報到身分配對（Mock DB）

- `POST /api/v1/checkin` 需符合 `source/mock/db.json` 的 `employees` 配對。
- 若姓名與員工編號不一致，預期回 `401`，`code=CHECKIN_IDENTITY_MISMATCH`。

### 9.5 全站 API 一鍵測試

在 `source/` 執行：

```bash
npm run test:api:all
```

此指令會依序驗證下列端點：

- `GET /api/v1/health`
- `GET /api/v1/health/ready`
- `GET /api/v1/events/{eventId}`
- `POST /api/v1/entry/verify`
- `POST /api/v1/checkin`
- `GET /api/v1/checkin/status`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/me/dashboard`（含 `ok/missing/invalid/full/empty/error`）
- `GET /api/v1/me/progress`（Mock：`scenario` 與 dashboard 對齊；含 `error`）
- `POST /api/v1/stations/verify`
- `GET /api/v1/challenges/{challengeId}`
- `POST /api/v1/challenges/{challengeId}/attempts`
- `POST /api/v1/me/playthrough/restart`
- `POST /api/v1/me/reward/claim`
- `POST /api/v1/staff/redeem/token`
- `POST /api/v1/staff/redeem/confirm`
- `POST /api/v1/admin/roster/import`
- `GET /api/v1/admin/reports/attendance`
- `GET /api/v1/admin/reports/progress`

對應實作：

- Mock Server：`source/mock/server.js`
- API 測試腳本：`source/mock/test-all-api.js`

### 9.6 闖關遊戲 API 專項測試

在 `source/` 執行：

```bash
npm run test:api:game
```

此指令專注驗證闖關流程：

- `POST /api/v1/entry/verify`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/me/dashboard`
- `POST /api/v1/stations/verify`
- `GET /api/v1/challenges/{challengeId}`
- `POST /api/v1/challenges/{challengeId}/attempts`（錯誤與正確答案）
- `GET /api/v1/me/progress`
- `POST /api/v1/me/reward/claim`
- `POST /api/v1/me/playthrough/restart`
- `POST /api/v1/auth/logout`

對應腳本：`source/mock/test-game-api.js`

---

---

**維護建議：**

- 當 `api-v0.1.md` 路徑或欄位有異動時，請同步更新本清單。
- 每次回歸測試前固定重置 seed，確保測試可重現。

