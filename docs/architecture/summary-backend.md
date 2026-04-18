# 後端技術與 API — 討論總結

> 本文件彙整**後端語言、框架、資料庫、業務模型與 API 文件**之討論結論。  
> **完整 REST 草案**見 [`api-v0.1.md`](../specs/api-v0.1.md)。

---

## 1. 技術棧（定案方向）

| 層級 | 選型 |
|------|------|
| 語言 | **Python 3** |
| Web 框架 | **FastAPI** |
| ASGI | **Uvicorn**；正式環境可 **Gunicorn + Uvicorn worker** |
| 資料庫 | **PostgreSQL** |
| ORM／驅動 | **SQLAlchemy 2.x（async）+ asyncpg**（或團隊偏好的等價組合） |
| 遷移 | **Alembic** |
| 設定 | **Pydantic Settings** + 環境變數 |

**選配**：**Redis**（熱讀快取、簡易 rate limit）；第一版可視壓測結果再加。

---

## 2. 與其他儲存的關係（專案背景）

- **執行路徑**（簽到、闖關進度、作答、領獎紀錄）以 **PostgreSQL** 為準，支援交易與併發。  
- **Google Sheet**（若保留）適合：**報名清冊匯入／報表匯出**，不宜作為即時高併發讀寫主儲存（官方 API 有每分鐘配額限制，見 Google Workspace 文件）。  
- 名冊建議活動前 **匯入 DB**，現場比對走資料庫。

---

## 3. 認證與安全

- 建議 **HTTP-only Cookie（session）** 或 **短期 JWT**（依資安與跨網域需求）。  
- **站點 QR**：內容為 **signed JWT**；後端 **驗簽**、**exp**、必要時 **jti 防重播**，避免竄改 URL 跳關。  
- **進場 QR**（若有）：同樣建議伺服器端驗證後再進簽到／登入流程。

---

## 4. 業務模型重點（討論定案）

| 項目 | 結論 |
|------|------|
| 簽到 vs 闖關登入 | **分開**：獨立 API 與流程（見 `api-v0.1.md` 之 `checkin` 與 `auth/login`）。 |
| 進度模型 | **作法 A**：**無獨立 `runId`／runs 表**；以單一使用者進度 + **`fullClearCount`／輪次** 等欄位表達「最多玩 3 輪」；再開一輪用 **`POST /api/v1/me/playthrough/restart`**。 |
| 關卡瀏覽資料 | **合併 API**：**`GET /api/v1/me/dashboard`** 一次回傳 stages + progress。 |
| 限流 | 伺服器端實作 **每使用者每分鐘 30 次**（可細分 bucket）；登入／簽到可更嚴。 |

---

## 5. API 文件

- 端點清單、請求／回應範例、畫面對照：**[`api-v0.1.md`](../specs/api-v0.1.md)**。  
- 後續可由此產生 **OpenAPI** 供前端型別與測試工具使用。

---

## 6. 效能實作要點（與流量文件呼應）

- **連線池** + DB 前 **PgBouncer**（若使用 Neon 等託管服務通常已內建／建議開啟）。  
- 讀多之資料（題幹若允許）可 **CDN 快取**；寫入集中於作答與進度更新。  
- 活動前以 **k6** 等依真實劇本壓測（見 [`summary-traffic.md`](./summary-traffic.md)）。

---

## 7. 待後續定案

- Staff 領獎 API 是否納入第一版（`api-v0.1.md` 已列可選 Phase 2）。  
- Admin 匯入名冊：HTTP 或離線腳本。  
- 與公司 **個資／留存政策** 對齊之欄位與刪除流程。

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-04-10 | 初稿：FastAPI、PostgreSQL、作法 A、JWT 站點、指向 api-v0.1 |
| 1.1 | 2026-04-19 | **§4**：合併 dashboard 端點改寫為 **`GET /api/v1/me/dashboard`**（與 `api-v0.1`、前端 `rewardClaimStatus.ts` 一致） |
| 1.2 | 2026-04-19 | **§4**：再開一輪端點改寫為 **`POST /api/v1/me/playthrough/restart`**（與 `api-v0.1` 一致） |
