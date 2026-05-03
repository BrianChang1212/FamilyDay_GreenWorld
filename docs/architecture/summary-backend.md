# 後端技術與 API — 討論總結

> 本文件彙整**後端語言、框架、資料庫、業務模型與 API 文件**之討論結論。  
> **完整 REST 草案**見 [`api-v0.1.md`](../specs/api-v0.1.md)。

---

## 1. 技術棧（定案方向）

| 層級 | 選型 |
|------|------|
| 後端平台 | **Google Firebase** |
| 主要資料庫 | **Cloud Firestore**（文件讀寫） |
| 即時能力（選用） | **Realtime Database**（高併發連線場景） |
| 認證 | **Firebase Authentication**（員編/姓名流程可由後端規則對齊） |
| 安全規則 | **Firebase Security Rules** |
| 離線能力 | **Local Cache**（客戶端離線暫存與恢復同步） |

**說明**：目前後端架構已改為 Firebase 方案，原 FastAPI/PostgreSQL 視為歷史討論方案。

---

## 2. 與其他儲存的關係（專案背景）

- **執行路徑**（簽到、闖關進度、作答、領獎紀錄）以 **Firebase（Firestore）** 為準。  
- **Google Sheet**（若保留）適合：**報名清冊匯入／報表匯出**，不作為即時高併發主儲存。  
- 名冊建議活動前匯入 Firebase，現場比對走同一資料來源。

---

## 2.0 本機服務帳戶與環境變數（Firestore 驗證）

**目的：** 在本機執行 `functions` 的 `npm run verify:firestore`，或讓 Functions／Admin SDK 寫入 **Cloud Firestore**（含名冊 `roster` 等一律走 Firestore 的路徑）時，需要具備專案 IAM 的**服務帳戶 JSON 金鑰**。

| 項目 | 說明 |
|------|------|
| **金鑰存放** | **不要**把 JSON 提交進 Git。可放在倉庫外（檔名／路徑依環境自訂；見 [`local-firestore-gcp.md`](../setup/local-firestore-gcp.md)）。 |
| **`GOOGLE_APPLICATION_CREDENTIALS`** | 設為金鑰檔的**絕對路徑**。未設定時，`verify-firestore-flow.mjs` 會直接失敗。 |
| **`GOOGLE_CLOUD_PROJECT`** | 目標 GCP／Firebase 專案 ID（例如 `familyday-greenworld-dev`）。 |
| **`FDGW_USE_FIRESTORE`** | 設為 `true` 時，簽到／遊戲進度等可切換為 Firestore 持久層（見 `functions/src/utils/store.ts`）。 |
| **輔助腳本** | `functions/scripts/cloud-firestore-dev.ps1` 可帶 `-CredentialPath`、` -ProjectId`、`-DatabaseId` 並執行 `verify`／`serve`；PowerShell 範例與 seed／purge 見 [`local-firestore-gcp.md`](../setup/local-firestore-gcp.md)（根 [`README.md`](../../README.md) 保留短連結）。 |

**與 ADC 的差異：** 僅依賴 `gcloud` 的 **Application Default Credentials**（使用者登入）時，行為與權限範圍可能與服務帳戶不同；整合驗證清單中的紀錄以「明確指定金鑰路徑」較易重現與除錯。

---

## 2.1 Firebase 方案補充（提案口徑與估算）

以下為「若改採 Firebase」的成本與限制補充，供會議比較使用。

### 提案口徑（來自簡報）

- 使用平台：Google Firebase（無伺服器架構）
- 活動規模：預計 **2,500 人**（`500 x 4 + 測試 + buffer`）
- 用量估算（寫入）：每人平均 **10 次寫入**，總計約 **25,000 次**
- 費用預算：預編 **USD 100**（待討論，實支實付）

### 家庭日流程估算口徑（簡報第二頁）

- 報到平台：寫入姓名、員編、同行人數與報到時間
- 闖關進度：6 關完成狀態
- 領獎紀錄：最多 3 次領取
- 合計：每人約 **10 次系統更新**；若以 **2,000 人次**估算，總計約 **20,000 次**

> 註：上方「2,500 人／25,000 次」與「2,000 人次／20,000 次」為不同估算場景，文件保留兩者供會議選定正式基準。

### A. Cloud Firestore（文件讀寫計價）

**估算前提（沿用目前活動假設）：**

- 規模：**3000 人**
- 每人寫入：報到(1) + 關卡完成(5) + 獎品領取(3) + buffer(1) = **10 writes/人**
- 每人讀取：狀態讀取與前端更新合計 **50 reads/人**

**單日活動量（粗估）：**

- Writes：`3000 x 10 = 30,000`
- Reads：`3000 x 50 = 150,000`

**以 Firestore 公開單價估算（Blaze，超額部分）：**

- 免費額度：`20,000 writes/day`、`50,000 reads/day`
- 超額寫入：`10,000` → `0.18 USD / 100,000 writes` => 約 **0.018 USD**
- 超額讀取：`100,000` → `0.06 USD / 100,000 reads` => 約 **0.06 USD**
- **合計：約 0.078 USD / 天**（不含稅，不含其他服務；數量級可視為 < 1 USD）
- **重點（寫入）**：Firebase Blaze 每日免費 `20,000 writes`；若多 `10,000 writes`，費用約 **0.02 USD**。

> 註：Firestore 另有刪除、索引讀取、儲存與對外流量成本；此處為簡化估算。

### B. Realtime Database（連線與流量計價）

- **Spark（免費）同時連線上限：100**
- **Blaze 同時連線上限：200,000 / database**
- Realtime DB 在 Blaze 主要依「儲存量 + 下載流量」計費（不是以讀寫次數單價）

若核心需求是高併發即時連線，Realtime DB 在連線上限上較 Spark 有明顯餘裕；但最終仍需以實際資料模型與下載量壓測驗證。

### C. 儲存量（粗估）

- 3000 筆輕量 JSON 在活動期通常仍屬低量級；以文件原估 **<100MB** 可作為初始假設
- 實際帳單仍取決於索引、保留天數、附件/圖片與出站流量

### D. Blaze 預算通知（建議）

Firebase/Google Cloud 可設定 **Budgets & Alerts** 做費用通知，建議：

1. 初期先設每月預算（例：**USD 10** 或 **USD 20**）
2. 門檻先設：`50% / 90% / 100%`（必要時加 `150% forecast`）
3. 通知對象：Billing 管理者 + 專案 DRI

> 重要：Budget Alert **只會通知，不會自動封頂停機**。若要自動動作，需串 Pub/Sub + 自動化流程（例如降載或人工介入）。

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
| 進度模型 | **作法 A**：**無獨立 `runId`／runs 表**；以單一使用者進度表達；**六關可任意順序完成**（`completedStageIds` 集滿 1–6）；**闖關可無限再玩**（`POST /api/v1/me/playthrough/restart` 僅要求當下已全通關）；**闖關禮最多領 3 次**（`maxRounds` + `rewardRedeemCount` + `bankedFullClears` 與 **`POST /api/v1/me/reward/claim`**）。 |
| 關卡瀏覽資料 | **合併 API**：**`GET /api/v1/me/dashboard`** 一次回傳 stages + progress；**`stages[].locked`**：**已通關**為 **`true`**（見 **`api-v0.1` §5**）。 |
| 限流 | 伺服器端實作 **每使用者每分鐘 30 次**（可細分 bucket）；登入／簽到可更嚴。 |

---

## 5. API 文件

- 端點清單、請求／回應範例、畫面對照：**[`api-v0.1.md`](../specs/api-v0.1.md)**。  
- 後續可由此產生 **OpenAPI** 供前端型別與測試工具使用。

### DB 設計參考入口

- Firestore collections、欄位型別、索引建議、Security Rules 草稿請見：
  **[`firestore-schema-v1.md`](./firestore-schema-v1.md)**。
- 本檔維持架構與策略層摘要；`firestore-schema-v1.md` 為資料模型落地草案。

---

## 6. 效能實作要點（與流量文件呼應）

- Firestore 以文件讀寫量做容量估算，優先控管高頻查詢與重複讀取。  
- Realtime Database 若用於高併發即時狀態，須監看同時連線與下載流量。  
- 活動前以真實劇本壓測（報到尖峰、闖關混合、領獎尖峰），並驗證離線回補行為（見 [`summary-traffic.md`](./summary-traffic.md)）。

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
| 1.3 | 2026-04-27 | 新增 **§2.1 Firebase 3000 人規模估算**：Firestore 讀寫粗估、Realtime DB 連線上限（Spark 100 / Blaze 200K）、Blaze 預算通知與限制 |
| 1.4 | 2026-04-27 | **§2.1** 補提案口徑：2,500 人/25,000 次寫入與 2,000 人次/20,000 次流程估算，供會議擇一作為正式基準 |
| 1.5 | 2026-04-27 | 後端定案改為 **Firebase**，替換原 FastAPI/PostgreSQL 主方案敘述 |
| 1.6 | 2026-05-03 | **§2.0**：`cloud-firestore-dev.ps1`／seed／purge 詳述改指向 [`setup/local-firestore-gcp.md`](../setup/local-firestore-gcp.md)；金鑰存放列改為泛化路徑說明 |
