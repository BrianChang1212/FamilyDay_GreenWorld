# 前端 + API + 模擬後端驗證流程（Mock API）

> 目的：在後端尚未完整上線前，先驗證前端 API 串接邏輯、錯誤處理與畫面呈現。  
> 範圍：涵蓋 `docs/specs/api-v0.1.md` 目前列出的全站 API（以 mock server 對應）。

---

## 1) 啟動方式

### 1.1 啟動 Mock API

在 `source/` 目錄執行：

```bash
npm run mock:api
```

預設埠號：`8787`  
可透過環境變數調整：`MOCK_API_PORT=9000 npm run mock:api`
PowerShell 寫法：`$env:MOCK_API_PORT=9000; npm run mock:api`

### 1.2 設定前端 API Base

於 `source/.env.local` 設定：

```env
VITE_API_BASE=http://localhost:8787
```

> 注意：修改 `.env.local` 後，需重新啟動 `npm run dev`。

### 1.3 啟動前端

在 `source/` 目錄執行：

```bash
npm run dev
```

---

## 2) 驗證案例（`/finish/claimed`）

> 驗證路徑：先走到完成頁，再進入領取成功頁（`/finish/claimed`）。

| 案例 | 請求範例 | 預期結果 |
|------|----------|----------|
| 正常（ok） | `/api/v1/me/dashboard` | 顯示 2/3 已領取（預設） |
| 缺欄位（missing） | `/api/v1/me/dashboard?scenario=missing` | 前端使用預設值，不應崩潰 |
| 非法值（invalid） | `/api/v1/me/dashboard?scenario=invalid` | 前端應做 clamp（不超出合理範圍） |
| 全領取（full） | `/api/v1/me/dashboard?scenario=full` | 顯示 3/3 已領取 |
| 空資料（empty） | `/api/v1/me/dashboard?scenario=empty` | 顯示 0/3 已領取 |
| 伺服器錯誤（error） | `/api/v1/me/dashboard?scenario=error` | 顯示 API 錯誤訊息或降級呈現 |

---

## 3) 快速切換 scenario

目前前端正式呼叫路徑為：

`GET {VITE_API_BASE}/api/v1/me/dashboard`

若要快速切換 scenario（不改程式碼）可暫時使用代理或手動測 API：

```bash
curl "http://localhost:8787/api/v1/me/dashboard?scenario=ok"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=missing"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=invalid"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=error"
```

---

## 4) 驗證完成標準

- `npm run test` 通過
- `npm run build` 通過
- 在設定 `VITE_API_BASE` 後，`/finish/claimed` 可讀取 Mock API 並正常呈現
- 針對錯誤與非法資料，畫面不崩潰且有可理解狀態
- `npm run test:api:all` 全部 PASS（全站 API smoke test）

## 4.1) 報到身分配對（Mock DB）

- `POST /api/v1/checkin` 需符合 `source/mock/db.json` 的 `employees` 配對。
- 若姓名與員工編號不一致，預期回 `401`，`code=CHECKIN_IDENTITY_MISMATCH`。

---

## 5) 全站 API 一鍵測試

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
- `POST /api/v1/stations/verify`
- `GET /api/v1/challenges/{challengeId}`
- `POST /api/v1/challenges/{challengeId}/attempts`
- `POST /api/v1/me/playthrough/restart`
- `POST /api/v1/staff/redeem/token`
- `POST /api/v1/staff/redeem/confirm`
- `POST /api/v1/admin/roster/import`
- `GET /api/v1/admin/reports/attendance`
- `GET /api/v1/admin/reports/progress`

對應實作：

- Mock Server：`source/mock/server.js`
- API 測試腳本：`source/mock/test-all-api.js`
