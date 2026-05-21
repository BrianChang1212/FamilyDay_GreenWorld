# 家庭日闖關系統 — 專案主文件（合併版）

> **專案：** 瑞軒 2026 家庭日闖關系統  
> **最後更新：** 2026-05-13  
> **工作約定（執行來源）：** **進度現況**（View／API 函式數／測試檔數／端點與阻塞敘述）以根目錄 [`README.md`](../../README.md#readme-live-progress) **「即時進度」** 區塊為準；**待辦勾選與行動清單**以本檔 [§ 待辦事項](#work-backlog) 為準。二者並列為日常跟進來源，更新時請避免只靠本檔舊數字敘述。根 README 長文已遷至 [`overview/root-readme-supplement.md`](../overview/root-readme-supplement.md)。  
> 前端流程與路由見 [`summary-frontend.md`](../architecture/summary-frontend.md)
> §2.1–§2.3；測試 Web UI／Netlify 預覽見根
> [`README.md`](../../README.md)；**測試 Web UI 錨點**見 [`docs/overview/root-readme-supplement.md#preview-netlify-test-ui`](../overview/root-readme-supplement.md#preview-netlify-test-ui)；部署摘要見
> [`summary-deployment.md`](../architecture/summary-deployment.md) §1.1；API 詳規見
> [`api-v0.1.md`](../api/api-v0.1.md)。  
> **維護：** 需求／待確認／技術細節以本檔為主；根 [`README.md`](../../README.md) 為總覽與**即時進度**；[`docs/README.md`](../README.md) 為 `docs/` 分類索引。

## 本文件目錄

- [提案來源與會議要點（2026-04-10）](#提案來源與會議要點2026-04-10)
- [需求與流程](#需求與流程)
- [待確認與會議](#待確認與會議)
- [專案狀態](#專案狀態)
- [待辦事項 · 工作來源](#work-backlog)
- [技術規格](#技術規格)
- [附錄：維護與閱讀順序](#附錄維護與閱讀順序)

### 架構與 API 補充文件（草案，待專案簽核）

| 檔案 | 說明 |
|------|------|
| [`api-v0.1.md`](../api/api-v0.1.md) | REST API v0.1 單一來源（簽到／登入分開、站點 JWT、`GET /api/v1/me/dashboard` 等端點與欄位、mock 驗證差異註記）。 |
| [`summary-frontend.md`](../architecture/summary-frontend.md) | 前端單一來源（Vue 3 + Vite + TS + Tailwind + Vue Router、`views/` 分群、`constants`/`i18n` 集中化、`api/` 與 `composables` 分層、Vitest 與 CI）。 |
| [`summary-backend.md`](../architecture/summary-backend.md) | 後端：Firebase（Firestore / Realtime Database）、安全規則與資料模型重點 |
| [`summary-deployment.md`](../architecture/summary-deployment.md) | 部署：Firebase 專案、Blaze 預算告警與環境分層；**§1.1** 靜態預覽、**測試 Web UI** 與 **CI**（**v1.6**）；操作細節見 [`setup/static-preview-netlify-github.md`](../setup/static-preview-netlify-github.md)，**測試 Web UI 錨點**見 [`overview/root-readme-supplement.md`](../overview/root-readme-supplement.md#preview-netlify-test-ui) |
| [`summary-traffic.md`](../architecture/summary-traffic.md) | 流量：在線≠RPS、限流、尖峰與壓測建議 |
| [`system-architecture.md`](../architecture/system-architecture.md) | 全系統架構圖（前端 + API + 後端／Hosting） |

**說明：** 上表為開發架構討論之**建議草案**，與本檔下方「技術規格」大章中歷史「待選項」並存；**正式定案**仍應經會議／IT／採購確認後更新本檔並勾選 [待確認與會議](#待確認與會議) 對應項目。操作示範錄影與截圖維護見 [`media/README.md`](../media/README.md)。

---

## 提案來源與會議要點（2026-04-10）

> 完整提案與口徑：**[`docs/proposals/FamilyDayApp_Proposal_v1.pdf`](../proposals/FamilyDayApp_Proposal_v1.pdf)**（2026.04.10）。會後整理與下列需求章節已對齊。

| 項目 | 內容 |
|------|------|
| 地點／對象／規模 | 新竹北埔綠世界；台北辦公室同仁及眷屬；約 **1,000～1,300** 人 |
| 活動日 | **確認中**（偏好**六月底**或**七月初**） |
| 核心交付 | **(1)** 事前報名表單→清冊（保險欄位、**1+3** 免費／第 5 人起加價等由主辦定案） **(2)** 現場簽到 Web（活動 QR、工號／姓名／同行人數、補休／餐飲勾稽、報到禮依報名人數） **(3)** 闖關 Web（**6** 關實體 QR、記名、**最多 3 次／3 份**、答錯可重答、完成後櫃檯**驗畫面**領獎，限量先到先選） |
| 節點 | 主視覺 **4/17**；流程／介面／文案 **4/24**（雙週會追蹤）；**5 月下旬**場勘 |
| Action | **Fendy Wei**：Logo、印花、CIS |

---

## 需求與流程

> **最後更新：** 2026-04-10  
> **預估人流：** 約 1,000～1,300 人  
> **系統類型：** Web 應用程式（簽到 + 闖關；事前報名多為表單）

### 一、人數與身分規則

#### 人流規劃
- **預估總人數：** 約 1,000～1,300 人（會議口徑）
- **同時在線：** 規劃需支撐活動日尖峰操作（建議仍依 1,300 級別做壓測假設）

#### 名額、報名與闖關規則

| 項目 | 規則 | 說明 |
|------|------|------|
| **事前報名** | **1+3** 免費；**第 5 人起**加收 | 表單與收費細則由主辦訂定並公告 |
| **簽到禮** | 依**報名人數**領取報到禮 | 與現場簽到紀錄勾稽 |
| **闖關次數／份數** | 同一工號**最多 3 次** | 眷屬分頭或同人重複玩；最多 **3 份**闖關紀念品 |
| **闖關獎項** | **限量**；**先到先選** | 大草皮櫃檯人工作業驗證畫面後領取 |

> **註：** 「3 次／3 份」為會議確認之闖關規則；與**報名加價（第 5 人起）**為不同層次之規則。

---

### 二、事前報名與現場簽到

#### 2.0 事前報名與統計（表單；多為 Google／企業維信表單）

- **目的：** 活動前統計人數與物流（遊覽車、午餐桌次等）。  
- **產出：** 報名清冊（如 Excel），含同仁填寫之完整資料。  
- **應收集（會議）：** 員工工號、姓名、參加人數、**每一位參加者**之身分證字號與出生年月日（**保險**所需）。  
- **名額：** 依 [一、人數與身分規則](#一人數與身分規則) 之「名額、報名與闖關規則」表辦理（標準與說明由主辦於表單載明）。  
- **待主辦提供：** 表單欄位明細、規則說明（人數限制、加價、保險必要性等）。

#### 2.1 現場簽到進場方式

**流程：** 掃描**報到專用 QR code**（或報到連結）→ 應用程式（見 §2.3、§2.4）→ **簽到／報到頁**（原型：`/checkin` **單頁**填姓名／員編／同行人數＋**確認彈窗**；**不**先經闖關用之共用登入頁）→ 報到完成頁 → 領報到禮 → 進入闖關（**另掃**闖關 QR、連結或導覽；見 H4）。  
**報到畫面順序與 Mermaid 流程圖：** [`summary-frontend.md`](../architecture/summary-frontend.md) **§2.2**。

##### 簽到頁欄位（會議）

| 欄位 | 狀態 | 說明 |
|------|:----:|------|
| 工號 | [V] | 必填 |
| 姓名 | [V] | 必填 |
| 同行人數 | [V] | 確認與報名一致，供核對餐飲／門票等 |
| 個人 QR 登記 | [X] | 不使用「每人一組個人 QR」作為登記；進場為**活動／專屬 QR** |

#### 2.2 簽到目的與報到禮

- **出席紀錄：** 作為事後核發**一天補休假**之憑證依據之一（實際以人資規定為準）。  
- **人數核對：** 實際到場與**預約餐飲／門票**等數據勾稽。  
- **報到禮：** 依**報名人數**領取第一份報到禮（與報名清冊勾稽）。

#### 2.3 介面設計（概念）

##### 已確認（方向）

- **實作架構（2026-04-18 補充；現況 2026-05-13 更新）：** 簽到與闖關為**同一 Web 應用程式**、**獨立路由**。**歷史原型（`source/` 等）：** 報到曾描述為 **`/checkin` 單頁**（姓名／員編／同行人數＋確認）。**`familyday-frontend` 現況：** **`/checkin`** 為**報到歡迎／引導**（`CheckInWelcomeView`），表單在 **`/checkin/register`**（`CheckInFormView`）；路由細節見 [`summary-frontend.md`](../architecture/summary-frontend.md) §2.1。**闖關**身分為 **`/register`**（姓名／員編）。可共用表單樣式元件，但** URL 與欄位**分流。
- **進入點（2026-04-18 補充；路徑 2026-05-11）：** 以**不同 QR code（或不同 URL）** 區分意圖——**掃報到用 QR** → **`/check-in`**（寫入意圖）→ **`/checkin`** 歡迎 → **`/checkin/register`** 表單；**掃闖關入口 QR** → **`/` 歡迎** → 說明 → **`/register`** → 關卡／地圖。若 URL 帶有站點參數（例如某關 JWT／站點代碼），身分就緒後再接續**到站驗證／題目頁**（細節見 [`api-v0.1.md`](../api/api-v0.1.md) 站點 JWT）。應保留 `entry`、`station` 等 query 或使用 `sessionStorage`，避免流程沖掉導向目標。

```
┌─────────────────────────────────────┐
│   簽到介面（獨立路由／頁面；同一 App）  │
│  • 工號、姓名、確認同行人數           │
│  • 領取報到禮（依報名人數）           │
└─────────────────────────────────────┘
              ⬇️（動線可另掃闖關 QR 或連結）
┌─────────────────────────────────────┐
│   闖關介面（獨立路由／頁面；同一 App）  │
│  • 綁定工號＋姓名；6 關／到站 QR      │
│  • 完成後至大草皮櫃檯驗證領獎         │
└─────────────────────────────────────┘
```

#### 2.4 QR 進入點與意圖分流（2026-04-18 補充）

> **註：** 舊稿「共用登入」多指闖關 **`/register`**；**報到**曾以 **`/checkin` 單頁**表述（歷史稿／`source/`）；**現況**見 [`summary-frontend.md`](../architecture/summary-frontend.md) §2.1（歡迎＋`/checkin/register`）。

| 項目 | 說明 |
|------|------|
| **目標** | 現場可印製**至少兩類**入口 QR：**報到**、**闖關**（闖關亦可再細分「總入口」與「各關到站 QR」，後者見 §3.1）。使用者掃碼後進入**同一網域／同一前端專案**，依 URL 參數或路徑決定登入後預設畫面。 |
| **報到 QR** | 連結指向例如 `/check-in?...` 或 `/?entry=checkin`（實際路徑以實作為準）。**`familyday-frontend`：** `/check-in` → **`/checkin`（歡迎）** → **`/checkin/register`（表單＋確認）**。**不**先走與闖關共用之 `/register`。 |
| **闖關 QR** | 連結指向例如 `/game?...` 或 `/?entry=game`；**原型（`source/`）：** `/game` 寫入意圖後導向 **`/` 歡迎**，再 **遊戲說明 → `/register` → 地圖／關卡**。若為某關到站，可附加站點 token／參數供後端驗證，身分就緒後接題目流程。 |
| **與 API 草案** | 簽到與闖關之 **REST 端點分開**（見 [`api-v0.1.md`](../api/api-v0.1.md)）；前端可共用**表單樣式元件**，並實作 **QR／意圖分流與路由**（報到 **`/checkin`／`/checkin/register`**；闖關 **`/register`**；細節見 [`summary-frontend.md`](../architecture/summary-frontend.md) §2.1）。 |
| **待產品定案** | **未報到是否允許進闖關**（建議：不允許時由路由守衛或後端拒絕；允許時需主辦明確同意）。 |

##### 待確認

- [ ] 報名清冊與簽到／闖關後端之**資料切分**（Sheet／DB）與同步時機  
- [ ] 簽到完成後進入闖關之**導航**（自動／手動／另掃碼）；**2026-04-18：** 已記錄選項——**另掃闖關入口 QR** 與**報到 QR 分流入**並存，實際以主辦與場勘定案為準（對照 H4）  
- [ ] 「報名人數」與「簽到同行人數」異常時之處理流程  

---

### 三、闖關與獎品機制

#### 3.1 關卡設計（0410 會議）

| 項目 | 規格 |
|------|------|
| **總關卡數** | 6 關（六大主題區；**5 月下旬場勘**後與園方確認布點） |
| **到站機制** | 各關**實體 QR code**（取代 GPS，減少誤差） |
| **題型** | 建議**三選一**或圈選題；簡單有趣、鼓勵參與 |
| **作答規則** | **答錯可立即重答，直到答對為止**（會議口徑） |
| **每關題數** | 舊稿曾列每關 3 題；**可與題庫設計併案**，以不超過現場體驗負擔為原則 |

##### 闖關流程（概念）

```
六站可任意順序完成 → 集滿 6 站即一輪通關（後端 `completedStageIds` 可供櫃檯驗證）
各站：掃描該站實體 QR → 答題（錯則同站重試至通過）→ 回地圖另選未完成之站
```

#### 3.1.1 闖關畫面順序（產品準線 · 掃描闖關入口 QR／連結之後）

> **範圍：** 僅**闖關動線**（不含報到，見 §2）。闖關登入僅**姓名／員編**；**同行人數**僅於報到收集。

逐步畫面、路由與互動之**單一維護來源**：[`summary-frontend.md`](../architecture/summary-frontend.md) **§2.1**（路由）、**§2.3**（闖關流程與步驟）。**完成／領獎**統一在 **`/finish`**（領獎狀態、次數上限、`?mock_claimed=` 等）— 見該檔與 [`api-v0.1.md`](../api/api-v0.1.md)。

#### 3.2 獎品兌換

- **完成條件：** 6 關全部完成後，至**大草皮櫃檯**由工作人員**驗證畫面**後領獎。  
- **獎項規則（會議）：** 獎品種類**限量**，採**先到先選**制；同一工號上限規範依 [一、人數與身分規則](#一人數與身分規則)。  
- **待確認：** 櫃檯核銷流程（僅目視 App、是否需另掃碼或蓋章）、剩餘獎項即時查詢需求。

---

### 四、技術與架構（精簡）

- **流程準線：** §2.1～§2.4（報到／闖關、QR 分流）；§3.1.1 之畫面細節見 [`summary-frontend.md`](../architecture/summary-frontend.md)。
- **API／站點 JWT：** [`api-v0.1.md`](../api/api-v0.1.md)。
- **全系統架構圖：** [`system-architecture.md`](../architecture/system-architecture.md)。
- **效能／壓測：** 尖峰以約 **1,300** 人規劃；見 [`summary-traffic.md`](../architecture/summary-traffic.md)。
- **堆疊（已定案實作）：** Vue 3 + Vite + TypeScript + Tailwind + Vue Router；後端 Firebase（Firestore 為主）；簽到 **`/checkin`**、闖關 **`/register`**；報名清冊與即時寫入之 Sheet／DB 分工見 [`summary-backend.md`](../architecture/summary-backend.md)。
- **待簽核與環境：** [`summary-deployment.md`](../architecture/summary-deployment.md)；細表見 [待確認與會議](#待確認與會議)。
- **0410 會後行動**已收斂至 [§ 待辦事項](#work-backlog) 與 H1～H5。

---

## 待確認與會議

> **最後更新：** 2026-04-10  
> **會議節奏：** 預計每週五 10:00（A1 會議室；以行事曆為準）

---

### 已確認項目（0410 會議對齊）

| # | 項目 | 結論 | 確認日期 |
|---|------|------|----------|
| 1 | 活動地點 | 新竹北埔綠世界生態農場 | 2026-04-10 |
| 2 | 活動對象／規模 | 台北辦公室同仁及眷屬；約 1,000～1,300 人 | 2026-04-10 |
| 3 | 活動日 | **確認中**（偏好**六月底**，或**七月初**） | 2026-04-10 |
| 4 | 架構分工 | **事前報名**以表單為主；**現場簽到**與**闖關**為 Web（Sheet + DB 混合仍適用） | 2026-04-10 |
| 5 | 報名名額／費用 | 依「名額、報名與闖關規則」主表（`1+3`／第 5 人起加收） | 2026-04-10 |
| 6 | 簽到方式 | **活動專屬 QR**；工號、姓名、**同行人數**；用途含補休憑證、餐飲／門票核對 | 2026-04-10 |
| 7 | 簽到禮 | 依**報名人數**發放第一份報到禮 | 2026-04-10 |
| 8 | 闖關到站 | **實體 QR** 取代 GPS | 2026-04-10 |
| 9 | 闖關記名 | 登入綁**工號＋姓名**；次數／份數上限依「名額、報名與闖關規則」主表 | 2026-04-10 |
| 10 | 作答規則 | **答錯可重答至答對**（鼓勵參與）；題型建議三選一或圈選 | 2026-04-10 |
| 11 | 闖關領獎 | **大草皮櫃檯**工作人員**驗畫面**；獎項**限量、先到先選** | 2026-04-10 |
| 12 | 介面分離 | 簽到頁與闖關頁分開 | 2026-04-10 |
| 13 | 主視覺節點 | 目標 **4/17 前**確認 | 2026-04-10 |
| 14 | 流程／UI／文案節點 | **4/24 前**確認；並以**雙週會**追蹤 | 2026-04-10 |
| 15 | 場勘 | 預計 **5 月下旬** | 2026-04-10 |

---

### 高優先級（影響開發）

| # | 項目 | 說明 | 負責人 | 狀態 |
|---|------|------|--------|:----:|
| H1 | 活動**確切日期** | 六月底 vs 七月初拍板（影響驗收倒排） | | [ ] |
| H2 | **表單欄位與清冊格式** | 保險欄位、加價規則文案；匯出 Excel 與簽到比對欄位 | | [ ] |
| H3 | **資料存儲與同步** | 報名清冊、簽到紀錄、闖關進度之 Sheet／DB 切分 | | [ ] |
| H4 | **簽到→闖關導覽** | 自動跳轉、手動按鈕或另掃碼 | | [ ] |
| H5 | **專屬 QR 發放與資安** | 簽到用 QR 如何印製／換發、是否需防複製 | | [ ] |

---

### 中優先級（影響功能）

| # | 項目 | 說明 | 負責人 | 狀態 |
|---|------|------|--------|:----:|
| M1 | 每關題數與題庫 | 舊稿每關 3 題可保留為參考；需與「錯了重試至對」UX 一致 | | [ ] |
| M2 | 人數統計定義 | 報名人數、簽到同行人數、實際領餐／門票之勾稽規則 | | [ ] |

---

### 低優先級（技術選型）

技術選型相關；**建議草案**已見 [`summary-frontend.md`](../architecture/summary-frontend.md) 等，**待正式簽核**後可將下列勾為完成。

| # | 項目 | 說明 | 負責人 | 狀態 |
|---|------|------|--------|:----:|
| 10 | Web 框架 | 草案：**Vue 3 + Vite + TS + Tailwind**（**+ Naive UI 可選**）；**實作：** 已含 Vue Router，無 Naive UI | | [ ] |
| 11 | RWD 需求 | 草案：**需要**（手機優先現場） | | [ ] |
| 12 | 效能測試 | 1,300 人級壓測；劇本與在線≠RPS 說明見 [`summary-traffic.md`](../architecture/summary-traffic.md) | | [ ] |
| 13 | Database 選型 | **定案：Firebase（Firestore 為主）** | | [x] |
| 14 | 資料同步 | Sheet 以匯入／匯出為主；**同步策略與時機仍待確認** | | [ ] |

---

### 設計相關待確認（Action：Fendy Wei／魏淑芬）

| # | 項目 | 說明 | 負責人 | 狀態 |
|---|------|------|--------|:----:|
| D1 | 主視覺 | Key Visual；**目標 4/17 前** | Fendy Wei | [ ] |
| D2 | 企業識別 | Logo、印花圖樣、CIS 等 | Fendy Wei | [ ] |

---

### 會議記錄

#### 2026-04-10 [MM] 0410_家庭日闖關遊戲開發（會後整理）
- 本條為會後追蹤摘要；詳見 [提案來源與會議要點（2026-04-10）](#提案來源與會議要點2026-04-10) 與 [需求與流程](#需求與流程)。

#### 例行會議（每週五 10:00 · A1）
- 議程建議：
  1. 高優先級 H1～H5（日期、表單、資料、導覽、QR 資安）
  2. 中優先級 M1、M2
  3. 設計資產 D1、D2（Fendy）
  4. 技術選型（原 #10～#14）

---

## 專案狀態

> **最後更新：** 2026-05-19。**所有計數與阻塞敘述**以根 [`README.md`](../../README.md#readme-live-progress) **即時進度**為準（與本段若有差異，**以 README 表格為準**）。  
> **專案階段：** **Firebase Hosting 已上架**（`rare-lattice-495009-i9.web.app`）；前後端重新部署完成（2026-05-19）；**報到（check-in）＋闖關（game）於正式環境功能驗證 Pass**（2026-05-19）。仍待：正式簽核、壓測與上線安全基線。

### 里程碑（概估）

需求與**前端主力功能**已落地；技術簽核、Firestore 端到端實證、壓測與正式部署仍待收斂。細部百分比不再於此重複維護。

### 快照（與 README 對齊 · 2026-05-19）

| 面向 | 摘要 |
|------|------|
| 前端 | **10** View（Welcome → Finish）；**11** 支 `api/` 函式；Vitest **14** 測試檔、CI 通過；**`/finish`** 領獎與三格狀態；舊 **`/finish/claimed`** → **`/finish`**；**認證：** Bearer + **`sessionStorage`**（[`ios-mobile-auth-fix-2026-05-13.md`](../setup/ios-mobile-auth-fix-2026-05-13.md)、**`api-v0.1` v0.1.25–v0.1.26**） |
| 後端 | **19** 端點；四集合 Firestore + in-memory；redeem transaction；**出席報表** **`total`**＝**`roster`** 計數、**`checkedIn`**＝**`checkins`**；**進度報表** **`players`／`fullClear`** 仍占位 |
| 驗證 | 整合測試 in-memory Pass 17（歷史）；`verify:firestore` 正式端點 **PASS**（四集合讀寫；2026-05-19）；**報到（check-in）＋闖關（game）正式環境功能驗證 Pass**（2026-05-19） |
| 產品／主辦 | [待確認與會議](#待確認與會議) H1～H5；設計 D1/D2 |

**細節：** [`summary-frontend.md`](../architecture/summary-frontend.md)、[`api-v0.1.md`](../api/api-v0.1.md)、[§ 待辦事項](#work-backlog)。

---

### 關鍵決策記錄

| 日期 | 決策 | 理由 | 影響 |
|------|------|------|------|
| 2026-04-10 | 採用 Web UI 而非 App | 跨平台、無需安裝、開發成本低 | 降低使用門檻，加快開發速度 |
| 2026-04-10 | 後端採用 Google Sheet + Database 混合架構 | Sheet 方便人工管理，DB 處理高併發 | 兼顧管理便利性與系統效能 |
| 2026-04-10 | 報到與闖關分為兩個獨立介面 | 流程清晰，功能分離 | 降低單頁複雜度，提升使用體驗 |
| 2026-04-18 | 同一 Web App 內**共用登入**；**報到 QR** 與**闖關 QR** 分流入，登入後導向對應模組 | 減少重複填寫；現場可區分進場意圖；與 wireframe「點連結或掃 QR」一致 | 前端需實作進入點保留與登入後 redirect；**未報到能否進闖關**仍待產品定案（§2.4） |
| 2026-04-10 | 事前報名與現場系統分離 | 表單（Google／維信）產清冊；Web 負責簽到與闖關 | 開發範圍與資料邊界清楚 |
| 2026-04-10 | 闖關到站以實體 QR 取代 GPS | 減少定位誤差 | 須場勘確認布點與防偽 |
| 2026-04-27 | **後端架構定案**（Vue+Vite+Firebase、API v0.1、流量與部署摘要） | 與會議成本估算及維運策略對齊，降低後端維運負擔 | 見本檔開頭補充文件表；後端以 Firebase 為準 |
| 2026-04-15 | **`source/` 前端可建置原型**（Vue Router、Tailwind、示範流程） | 驗證技術鏈與 UX 假設；與後端解耦 | Naive UI 未裝；見 `summary-frontend.md` v1.1 |
| 2026-04-16 | **完成頁 `/finish` 領獎流程（原型）** | 對齊主規則表之次數／份數上限與櫃台驗證情境；先以瀏覽器暫存類比領取次數 | 見 `summary-frontend.md` v1.2（**現況**見 **v1.33**）；**REST 準線**見 [`api-v0.1.md`](../api/api-v0.1.md) **以檔首修訂為準**（**v0.1.26** 登入 JSON 示例；**v0.1.25** Bearer；**v0.1.24** 等文件維護：**無** REST 語意變更）。玩家 **`POST …/me/reward/claim`** 與櫃台 **`staff/redeem/*`** 已列 MVP；後端已落地，營運是否啟用依主辦 |
| 2026-04-30 | Cloud Functions 作為首階段後端執行層 | 可快速承接既有 REST 契約並以最小變更完成前後端聯調 | 核心與 Phase 2 端點已落地，前端可直接驗證 |
| 2026-04-30 | CORS 採固定 allowlist 白名單策略 | 先堵住任意 Origin 風險，符合活動前最小安全基線 | 白名單來源可通過，非白名單不回傳 ACAO |
| 2026-04-30 | Firestore 採環境旗標切換（`FDGW_USE_FIRESTORE`） | 允許 in-memory 與 Firestore 並行驗證，降低切換風險 | 目前阻塞點聚焦為 IAM 權限，便於分工追蹤 |
| 2026-05-13 | **闖關 SPA 認證改 Bearer（跨 Firebase Hosting ↔ Cloud Run）** | iOS／WebKit ITP 與 CDN 對第三方 Cookie 限制導致無法依 Cookie 維持登入；改 **`login` 回 `token`** + **`Authorization: Bearer`** + **`sessionStorage`** | 見 [`docs/setup/ios-mobile-auth-fix-2026-05-13.md`](../setup/ios-mobile-auth-fix-2026-05-13.md)；契約 **`api-v0.1` v0.1.25–v0.1.26**、`system-architecture` v1.3–v1.4 |
| 2026-05-13 | **Firebase Hosting 上架後全端驗收（報到＋闖關）** | 於線上環境走完整使用者動線，確認 UI／API 與需求一致 | **Go（UX／功能）**；紀錄於 [`api-integration-checklist.md`](../testing/api-integration-checklist.md) §7 與 [`api-integration-history.md`](../testing/api-integration-history.md)；不等同 §1–§6 CLI 全自動逐項 |

---

### 風險與問題追蹤

#### 高風險 🔴

| 風險 | 影響 | 應對策略 | 負責人 | 狀態 |
|------|------|----------|--------|:----:|
| 1,300 人併發可能超出系統負載 | 系統崩潰，活動無法進行 | 提前壓力測試、準備擴展方案 | | 監控中 |
| 活動日前驗收窗口緊（目標六月底／七月初） | 功能不完整或品質不佳 | MVP、倒排驗收；5 月下旬場勘後凍結動線相關需求 | | 監控中 |
| Firestore IAM 未完成導致最終實證未閉環 | 正式資料層無法完成 Go 証明，影響正式上線判定 | 立即補齊專案 IAM（Cloud Datastore User+）並重跑 `npm run verify:firestore` | Brian / 專案 Owner | ✅ 已解決（2026-05-19） |

#### 中風險 🟡

| 風險 | 影響 | 應對策略 | 負責人 | 狀態 |
|------|------|----------|--------|:----:|
| Google Sheets API 限制 | 資料同步延遲 | 使用 Database 處理即時資料 | | 監控中 |
| 設計資產延遲取得 | UI 開發延遲 | 先用 placeholder 開發功能 | | 監控中 |

#### 低風險 🟢

| 風險 | 影響 | 應對策略 | 負責人 | 狀態 |
|------|------|----------|--------|:----:|
| 網路不穩定 | 部分使用者無法使用 | 離線快取、重試機制 | | 監控中 |

---

<a id="work-backlog"></a>

### 待辦事項（2026-05-20 更新）

**工作約定：** 日常跟進以本節為**待辦權威**；**進度數字**以根 [`README.md`](../../README.md#readme-live-progress) **即時進度**為準。完成項目請於此勾選並視需要同步 README 摘要。

#### 高優先級
- [x] **Firestore IAM 憑證設定**（SA JSON `GOOGLE_APPLICATION_CREDENTIALS`）— 完成 2026-05-19
- [x] 重跑 `familyday-backend/`：`npm run verify:firestore` 對正式 Cloud Functions 端點，四集合讀寫 **PASS** — 完成 2026-05-19
- [x] **外部 QR scanner 相容** — 站台 PNG 改編碼為 `https://<host>/scan?t=<JWT>` 深連結；SPA 新增 `/scan` dispatcher（已登入直接進 quiz、未登入導 register 後接續）；內嵌 scanner 與外部相機共用 `src/lib/qrPayload.ts` 解析器 — 完成 2026-05-20
- [x] **闖關紀錄保留** — `RegisterView` 登入移除 `restartPlaythrough`；`applyAttemptResult` 移除 stage-1 auto-reset：全破玩家再登入或重玩任一站，`completedStageIds` 永久保留；獎勵領取仍由 `claimFinishRewardProgress` 控管（maxRounds=3） — 完成 2026-05-20
- [x] **站點重玩擋阻移除** — `StageView` 不再以 `isStageCompleted` 擋掉同關 QR；後端 `applyAttemptResult` 對重複作答 idempotent — 完成 2026-05-20
- [x] **ResultView 三向分流 + StageView 領獎入口** — 首次全破 → 「闖關成功！領取闖關禮」(/finish)；已 6/6 重玩答對 → 「回到關卡列表」(/stage)；StageView 6/6 時下方常駐「前往領取闖關禮」CTA → /finish。決策邏輯 `src/lib/resultAction.ts` 純函式，6 個單元測試覆蓋 — 完成 2026-05-20
- [x] **領獎入口 QR (`/reward`)** — 新增第 7 張 `entry-reward.png`（編碼為 `https://<host>/reward`）；已登入 → `/finish`；未登入 → `/register` → 登入後讀 `pendingFinish` 跳 `/finish`。`/scan` 與 `/reward` 互斥清除對方旗標。Router test 加 2 case；qr-entry-links README 同步更新 — 完成 2026-05-20
- [x] **領獎防誤領（掃 QR 才能領）** — FinishView 點「領取闖關禮」改成全屏掃 QR；掃到工作人員手持 QR (`fdgw-claim-token`) 才呼叫 `/me/reward/claim`。解析邏輯 `src/lib/claimPayload.ts`（6 unit tests）。PNG `public/qr-staff-stations/claim-token.png`；`npm run qr:claim` 重新產生 — 完成 2026-05-20
- [x] **Hero 視圖 fullBleed + 換新版主視覺** — App.vue 對 `route.meta.fullBleed` 跳過白卡 / safe-area padding；WelcomeView 最終維持原 `game-welcome-enroll-04.jpg` 並保留 logotype（中間曾換 `01_welcomeBG.jpg` 1152×2048 後復原，commit `6ce9b52`）；BriefingView 地圖換新版扁平風（`02_mapIllu.png`，688×752）— 完成 2026-05-20
- [x] **設計師原版 icon 套用** — StageView 闖關進度標題 icon 換為山+旗 silhouette；FinishView 領獎狀態標題 icon 換為獎章+星+雙緞帶 silhouette；領獎三格 slot 改用設計師 PNG（`Icon_gift_s_active.png` 已領 / `Icon_gift_s_disabled.png` 未領），取代 inline SVG 與 wrapper 樣式 — 完成 2026-05-20
- [x] **正式 Firebase 專案上架 — 並行部署** — 新增 `familyday-greenworld` 為正式專案，與測試 `rare-lattice-495009-i9` 並存（`.firebaserc` 加 `staging`/`production` aliases）；首次上架完成 Hosting/Functions/Firestore；111 筆 zh roster 已匯入正式 Firestore；entry-link QR PNG 已改指正式 host；登入功能於正式環境驗證 Pass。同步修 backend `store.ts::getDb()`（預設 DB 用 `getFirestore()` 不帶參數，避免 5 NOT_FOUND）— 完成 2026-05-21
- [x] **領獎時間戳記** — `PlayerProgress` 加 `rewardRedeemAt: string[]`；每次 `claimFinishRewardProgress` 成功時 push 當下 ISO 時間並寫回 Firestore。為活動日資料紀錄表 (家庭日當天資料紀錄表.xlsx) 之「領獎時間一/二/三」欄位預備直接資料源；無 REST 契約變更；coercePlayerProgress 對舊文件 fallback `[]` — 完成 2026-05-21
- [ ] 產出正式上線前最小安全基線確認單（憑證、權限、CORS、**Bearer／sessionStorage（XSS）**、Cookie 相容）

#### 中優先級
- [x] **`GET /admin/reports/progress` 占位欄位** — `players`／`fullClear` 已改為 `state/game.ts::getProgressSummary()` 對 `player_progress` 集合的真實聚合（Firestore + in-memory 雙模式）；`redeemed` 來自 `getRedeemSummary()`。見 `familyday-backend/src/routes/admin.ts:42-52`、`familyday-backend/src/state/game.ts:289-315`、commit `b91b7a3` — 完成 2026-05-19
- [ ] 完成 dev/stage 驗證 runbook（含 `VITE_API_BASE`、`FDGW_USE_FIRESTORE`、憑證設定步驟）
- [x] 建立後端 Vitest 單元測試基線（http/session/authGuard/game state/health route；**5** 檔／**27** 測試；含「完成一次後可連續領獎至上限」規則）
- [ ] 擴充後端關鍵路徑自動化（checkin/redeem/admin/Firestore mock 或 emulator）
- [ ] 補齊 Firestore Security Rules 初稿

#### 低優先級
- [ ] 規劃 k6 壓測腳本（1,300 人併發）與活動日前演練節點
- [ ] 設計資產到位後進行 UI 文案與視覺一致性檢查

---

### 資源與節點

- **人力／預算：** [待指定]／[待評估]  
- **活動日：** 確認中（六月底／七月初優先）；**節點：** KV 4/17、流程 4/24、5 月下旬場勘  
- **維護：** 建議每週五 10:00 會後更新本檔與根 README「即時進度」；會議前複核 [待確認與會議](#待確認與會議) H1～H5。

---

## 技術規格

> 與「需求與流程」內 **§ 四、技術與架構（精簡）** 及開頭 [架構與 API 補充文件](#架構與-api-補充文件草案待專案簽核) 並讀。本章只列**維護準線**，避免與 `summary-*.md` / `api-v0.1.md` 重複堆疊。

### 詳規分工（單一來源）

- 前端流程、路由、模組分層：`docs/architecture/summary-frontend.md`
- 後端選型、成本與安全：`docs/architecture/summary-backend.md`
- 部署、告警與環境策略：`docs/architecture/summary-deployment.md`
- 流量、尖峰與壓測：`docs/architecture/summary-traffic.md`
- API 端點與 JSON 範例：`docs/api/api-v0.1.md`
- 欄位與資料模型：以前兩者為準，本檔不重複欄位表

### 開發與驗證最低要求

1. 新功能需更新對應單一來源文件（前端／後端／部署／流量／API 其一）。  
2. 若涉及 API 行為，必須先同步 `api-v0.1.md`。  
3. 送審前至少完成：前端單元測試、關鍵流程手動驗證、文件版本鏈同步。

### 近期技術待辦（精簡）

- [ ] 建立 Firebase `dev/stage/prod` 專案與權限分層  
- [ ] 補齊 Security Rules 初稿與審查清單  
- [ ] 完成簽到尖峰與闖關混合壓測（k6 劇本）  
- [ ] 盤點正式上線前必要監控與預算告警門檻  

---

## 附錄：維護與閱讀順序

### 單檔維護

| 時機 | 更新 |
|------|------|
| 需求變更 | 本檔「需求與流程」與相關待確認列 |
| 會議後 | 「待確認與會議」與「專案狀態」 |
| 技術決策 | 「技術規格」 |
| 里程碑 | 根目錄 [`README.md`](../../README.md#readme-live-progress) **即時進度**與本檔 [§ 待辦事項](#work-backlog) |
| `docs/` 結構變更 | 同步更新 [`docs/README.md`](../README.md) 索引表與根 README 路徑 |

### 建議閱讀順序（角色）

| 角色 | 順序 |
|------|------|
| PM | 根 [`README.md`](../../README.md#readme-live-progress) **即時進度** → 本檔 [§ 待辦事項](#work-backlog) →「專案狀態」→「待確認與會議」→「需求與流程」 |
| 開發 | 根 [`README.md`](../../README.md#readme-live-progress) **即時進度** → 本檔 [§ 待辦事項](#work-backlog) →「技術規格」→「需求與流程」→「待確認與會議」 |
| UI/UX | 根 [`README.md`](../../README.md) → 本檔「需求與流程」→「待確認與會議」 |
| 測試 | 根 [`README.md`](../../README.md#readme-live-progress) → 本檔「需求與流程」→「技術規格」 |

### FAQ（精簡）

1. **新進成員：** 先讀根 [`README.md`](../../README.md#readme-live-progress) **即時進度**，再讀本檔 [§ 待辦事項](#work-backlog) 與「需求與流程」。
2. **需求變更：** 改本檔並同步根 [`README.md`](../../README.md#readme-live-progress) 摘要（若影響進度敘述）。
3. **會議前：** 檢視「待確認與會議」高優先級表格。

---

**文件版本：** 合併版 v1.3.64 · 2026-05-21（待辦同步：補勾「`GET /admin/reports/progress` 占位欄位」中優先項——實際已於 2026-05-19 完成（commit `b91b7a3`）並已記錄於根 `README.md` v2.88，僅本檔待辦清單未同步；前版 **v1.3.63**）
