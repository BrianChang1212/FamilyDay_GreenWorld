# 家庭日綠世界闖關 Web — API 規格（v0.1 草案）

> 狀態：**假設草案**，供前後端對齊；簽到與闖關登入**分開**、站點 QR 為 **signed JWT**、進度為**作法 A（無獨立 runId）**、關卡瀏覽使用**單一合併** `GET /me/dashboard`。

---

## 全域約定

| 項目 | 說明 |
|------|------|
| API Base | `/api/v1` |
| 格式 | `Content-Type: application/json` |
| 認證 | 簽到／闖關登入成功後建議使用 **HTTP-only Cookie（session）**；需登入的 API 未帶有效 session 時回 **401** |
| 錯誤 | 建議 `{ "code": "STRING", "message": "人可讀說明" }` |
| 限流 | **每位使用者每分鐘最多 30 次請求**（可再細分 bucket）；`login`、`checkin` 建議獨立或較嚴格 |

完整路徑範例：`GET https://<host>/api/v1/me/dashboard`

---

## 1. 健康檢查

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/health` | 存活檢查（可不查資料庫） |
| GET | `/api/v1/health/ready` | 就緒檢查（含資料庫連線） |

---

## 2. 活動／進場（選用，依 QR 設計）

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/events/{eventId}` | 活動是否開放、顯示名稱、設定版本（利於快取） |
| POST | `/api/v1/entry/verify` | 進場 QR 內 **signed JWT** 或 token，**伺服器驗簽**後再進簽到／登入頁 |

**`POST /api/v1/entry/verify` 請求體（示例）**

```json
{
  "token": "<jwt_or_compact_payload>"
}
```

---

## 3. 簽到（與闖關分開）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/checkin` | 送出簽到（工號、姓名、同行人數等，依表單／名冊） |
| GET | `/api/v1/checkin/status` | 查是否已簽到（供 UI） |

**`POST /api/v1/checkin` 請求體（示例）**

```json
{
  "employeeId": "E12345",
  "name": "王小明",
  "partySize": 3
}
```

---

## 4. 闖關登入

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 工號＋姓名驗證（名冊），建立**闖關用 session** |
| POST | `/api/v1/auth/logout` | 登出 |
| GET | `/api/v1/auth/me` | 目前登入者摘要（工號、顯示名等） |

**`POST /api/v1/auth/login` 請求體（示例）**

```json
{
  "employeeId": "E12345",
  "name": "王小明"
}
```

---

## 5. 關卡瀏覽（合併 API）

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/me/dashboard` | **六關列表 + 個人進度 + 通關／輪次狀態**（關卡瀏覽頁建議僅呼叫此端點） |

**`GET /api/v1/me/dashboard` 回應（示例）**

```json
{
  "event": {
    "id": "greenworld-2026",
    "name": "瑞軒家庭日"
  },
  "stages": [
    {
      "id": 1,
      "title": "水鳥區",
      "order": 1,
      "locked": false
    }
  ],
  "progress": {
    "currentStageId": 3,
    "completedStageIds": [1, 2],
    "allCompleted": false,
    "fullClearCount": 0,
    "canStartNewRound": true,
    "maxRounds": 3
  }
}
```

**作法 A（無獨立 runId）**：進度以單一使用者狀態表示；`fullClearCount`、`canStartNewRound` 等欄位名稱可依實作調整。

---

## 6. 站點 QR（signed JWT）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/stations/verify` | 掃描**該關實體 QR** 所得 JWT：**驗簽**、**exp**、必要時 **jti 防重播**；通過後回傳挑戰資訊 |

**請求體（示例）**

```json
{
  "stageId": 3,
  "qrJwt": "<signed_jwt_from_qr>"
}
```

**回應（示例）**

```json
{
  "ok": true,
  "challengeId": "ch_01HZZZZ",
  "expiresAt": "2026-06-30T12:00:00Z"
}
```

---

## 7. 題目與作答

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/v1/challenges/{challengeId}` | 取得題目與選項（**不回傳正解**） |
| POST | `/api/v1/challenges/{challengeId}/attempts` | 送答案；錯誤可再送，直到答對（與活動規則一致） |

**`POST /api/v1/challenges/{challengeId}/attempts` 請求體（示例）**

```json
{
  "choiceId": "B"
}
```

**回應（示例）**

```json
{ "correct": true, "nextStageId": 4 }
```

答錯時可回 `{ "correct": false }`；仍受每分鐘請求上限約束。

---

## 8. 再玩一輪（作法 A）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/me/playthrough/restart` | 在 **`fullClearCount < maxRounds`** 且商業規則允許時，**重置本輪進度**（例如 `currentStageId`、已完成關卡），開始下一輪 |

**回應（示例）**

```json
{
  "ok": true,
  "fullClearCount": 1,
  "remainingRounds": 2
}
```

若規則不允許（例如未通關不可重開），回 **409** 並附 `code`。

---

## 9. 櫃台領獎（工作人員）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/staff/redeem/token` | 玩家符合資格後，產生**短期**領獎用 token／內容供櫃台掃描（需玩家已登入） |
| POST | `/api/v1/staff/redeem/confirm` | **工作人員帳號**（權限驗證）確認領獎並寫入紀錄 |

若第一版改為純人工核對畫面、不建 staff 帳號，可列為 **Phase 2**。

---

## 10. 管理後台（選用）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/v1/admin/roster/import` | 匯入報名名冊 |
| GET | `/api/v1/admin/reports/attendance` | 出席報表 |
| GET | `/api/v1/admin/reports/progress` | 闖關統計 |

亦可改由離線腳本寫入資料庫，不必暴露 HTTP。

---

## 11. 前端畫面與 API 對照

| 畫面／動作 | API |
|------------|-----|
| 進場驗證（若有） | `POST /api/v1/entry/verify` |
| 簽到 | `POST /api/v1/checkin`、`GET /api/v1/checkin/status` |
| 闖關登入 | `POST /api/v1/auth/login` |
| 關卡瀏覽／手動刷新 | `GET /api/v1/me/dashboard` |
| 掃站點 QR | `POST /api/v1/stations/verify` |
| 載入題目／作答 | `GET /api/v1/challenges/{challengeId}`、`POST /api/v1/challenges/{challengeId}/attempts` |
| 再玩一輪 | `POST /api/v1/me/playthrough/restart` |
| 領獎（若有） | `POST /api/v1/staff/redeem/token`、`POST /api/v1/staff/redeem/confirm` |

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| v0.1 | 2026-04-10 | 初稿：整合簽到／登入分開、JWT 站點、作法 A、合併 dashboard |
