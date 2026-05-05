# 前後端 API 整合驗證清單（精簡版）

> 適用範圍：[`docs/specs/api-v0.1.md`](../specs/api-v0.1.md)  
> 目的：用最短流程驗證「前端 UI + API + 後端資料層」是否可用。  
> 詳細補充：  
> - Mock 流程：[`api-mock-testing.md`](./api-mock-testing.md)  
> - 歷史執行紀錄與 Go/No-Go：[`api-integration-history.md`](./api-integration-history.md)

---

## 0) 測試前準備（必做）

- `VITE_API_BASE` 已指向目標 API（本機常用 `/fdgw-emulator-api`）。
- 已清除瀏覽器 session / localStorage（避免前次狀態污染）。
- 若用 Firestore：已設定 `GOOGLE_APPLICATION_CREDENTIALS`、`GOOGLE_CLOUD_PROJECT`、`FDGW_USE_FIRESTORE=true`。
- `fdgw.project.json` 與 `.firebaserc` 的專案 ID 一致。

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
- `GET /api/v1/checkin/status` 與 UI 顯示一致。

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

## 7) 執行結果模板

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
