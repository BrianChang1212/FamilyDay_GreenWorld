# 前後端 API 整合驗證清單（Checklist）

> 適用範圍：`docs/specs/api-v0.1.md`（目前修訂至 v0.1.7）  
> 目的：用「前端實際操作」驗證 API 契約、錯誤處理與資料一致性。

---

## 0) 測試前準備

- 前端使用測試環境（非正式環境）
- `VITE_API_BASE` 已指向測試 API（例如 `/api/v1`）
- 已載入固定測資（seed）且記錄 seed 版本
- 已清空上次測試 session / local storage（避免汙染）
- 測試紀錄模板已建立（案例 ID、預期、實際、截圖、API 回應）

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
- `fullClearCount` / `remainingRounds` 更新正確

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

## 8) 建議執行順序（快速版）

1. 健康檢查（`health` / `ready`）
2. 報到流程（`checkin`）
3. 登入 + dashboard（`auth/login` + `me/dashboard`）
4. 站點 + 作答（`stations/verify` + `attempts`）
5. restart / redeem 邊界驗證
6. 401 / 409 / JWT 過期 / 重播等異常場景

---

---

**維護建議：**

- 當 `api-v0.1.md` 路徑或欄位有異動時，請同步更新本清單。
- 每次回歸測試前固定重置 seed，確保測試可重現。

