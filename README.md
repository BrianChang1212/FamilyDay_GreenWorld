# 瑞軒 2026 家庭日 — 解謎 App（綠世界生態農場）

<p align="center">
  <img src="source/public/images/family-day-forest-walk.png" alt="瑞軒家庭日綠世界主視覺：一家人攜手漫步林間小徑" width="720" />
</p>

## 目錄

- [快速開始](#快速開始)
  - [介面預覽（截圖）](#ui-preview-screenshots)
- [專案概覽](#專案概覽)
- [Demo 影片預覽](#demo-影片預覽)
- [技術架構](#技術架構)
  - [系統架構圖](#系統架構圖)
- [規格與活動內容](#規格與活動內容)
- [使用者流程](#使用者流程)
- [設計資產與會議](#設計資產與會議)
- [待辦與進度](#待辦與進度)
- [儲存庫目錄結構](#儲存庫目錄結構)
- [文件與維護](#文件與維護)

---

## 快速開始

### 取得程式庫

```bash
git clone https://github.com/BrianChang1212/FamilyDay_GreenWorld.git
cd FamilyDay_GreenWorld
```

（若本機路徑為 `20260410_FamilyDay_GreenWorld_App`，與上列為同一專案內容時，可略過 clone，直接在該資料夾操作。）

### 只讀文件／規格

1. 開啟 `[docs/README.md](docs/README.md)` 了解 `docs/` 分類。
2. 完整需求與會議基線：`[docs/project/專案文件.md](docs/project/專案文件.md)`。
3. API 與架構摘要：`docs/specs/`、`docs/architecture/`（見上列索引）。

### Windows：安裝 Node.js 與 npm（winget）

若 PowerShell 出現 **npm** 無法辨識，代表尚未安裝 Node.js，或 PATH 尚未載入。

**1. 以 winget 安裝（建議：無系統管理員權限時用「使用者範圍」）**

全系統安裝（預設）在**非系統管理員**環境可能失敗（MSI **Error 1925**／結束代碼 **1603**：權限不足）。可改為只安裝給目前使用者：

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --disable-interactivity --scope user
```

成功時 winget 會提示已新增 `node` 指令，並可能提示**需重新開啟終端機**才會套用 PATH。

**2. 同一個終端機內立即套用 PATH（不必重開 Cursor 時可先執行）**

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
node -v
npm -v
```

**3. 安裝專案相依套件（在 `source/`）**

```powershell
cd D:\Brian\dev\FamilyDay_GreenWorld\source
npm install
```

（若上一步已執行過 `npm install`，可略過。本機曾驗證：**Node v24.14.1**、**npm 11.x**。）

**4. 全系統安裝（選用）**

若要以**系統管理員**安裝給所有使用者：以系統管理員開啟 PowerShell，執行 `winget install OpenJS.NodeJS.LTS ...`（**不要**加 `--scope user`），並依 UAC 提示同意。

**5. 安裝失敗時的記錄檔（winget／MSI）**

路徑範例（實際檔名含時間戳記）：

`%LOCALAPPDATA%\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\LocalState\DiagOutputDir\`

內可搜尋 **Error 1925**、**1603** 對照權限或舊版衝突。

---

### 本機執行前端原型（`source/`）

**需求：** [Node.js](https://nodejs.org/) **20 LTS 或以上**皆可；本倉庫曾以 **winget LTS 套件（例如 v24.x）** 驗證。須能執行 `node`、`npm`。

```bash
cd source
npm install
npm run dev
```

（`npm install` 與上一節 Windows 步驟重複時，擇一執行即可。）

瀏覽器開啟終端機顯示之本機網址（Vite 預設多為 **[http://localhost:5173](http://localhost:5173)**）。  
建置預覽：`npm run build` 後 `npm run preview`。

**說明：** 後端 API 尚未串接時，多數畫面仍以 mock／靜態流程為主。**未設定 `VITE_API_BASE` 時**，完成頁領獎次數會以瀏覽器 `sessionStorage` 類比（僅供預覽）；若要以**真實後端**顯示次數，請於 `source/` 建立 `.env.local`（或建置環境變數）設定 **`VITE_API_BASE`**（API 主機根、無尾隨 `/`），詳見 `docs/architecture/summary-frontend.md` §4。定案見 `docs/specs/api-v0.1.md` 與 `docs/architecture/summary-backend.md`。

<a id="preview-netlify-test-ui"></a>

### 公開預覽部署 · 測試 Web UI

> 給他人用手機／瀏覽器試操作，可不接後端；與 [`docs/architecture/summary-deployment.md`](docs/architecture/summary-deployment.md) **§1.1**（修訂 **v1.3**）、[`docs/architecture/summary-frontend.md`](docs/architecture/summary-frontend.md) **§4** 互相連結。

靜態檔來自 `source/` 的 `npm run build` 產物（`source/dist`）。**建議優先使用 Netlify**（子路徑與 Vue Router 較省事）；亦可使用本倉庫內建的 GitHub Actions 發布至 GitHub Pages。

> **用途標記 · 測試 Web UI 操作**  
> 下表 **Netlify 網址**與 **QR 用連結**僅供 **測試介面與流程**（內部／利害關係人預覽）。**非**正式活動對外定案之網域或 SLA；正式上線請改用公司核可的網域、後端與資安設定。若於 Netlify **變更站名或自訂網域**，請同步更新本段與實體 QR 內嵌網址。

#### 測試 Web UI：Netlify 預覽站（與 GitHub 連動）

| 項目 | 說明 |
|------|------|
| **預覽網址（範例）** | **[https://familyday-greenworld.netlify.app](https://familyday-greenworld.netlify.app)** — 以 Netlify **Domain management** 顯示為準 |
| **自動更新** | 站台已 **Connect to Git** 時，對 **`main`**（或綁定分支）**push** 且建置成功後，線上 UI 即為新版；失敗時仍為上一版 **Published** |
| **首次匯入注意** | 設定畫面須填 **Base directory：`source`**（與 [`netlify.toml`](netlify.toml) 一致）；**Publish directory：`dist`**；**勿**設 `VITE_BASE_PATH`（站點在網域根目錄） |
| **存續** | 站點未刪除、帳號與方案有效時，網址通常**持續可用**；免費方案有建置分鐘／流量等額度，見 [Netlify 方案說明](https://www.netlify.com/pricing/) |

**報到／闖關分流（同一預覽站、不同路徑 — 印靜態 QR 時請含完整 `https`）**

| 用途 | 測試用連結（範例網域同上；若更換請只替換主機名） |
|------|------|
| 報到 | `https://familyday-greenworld.netlify.app/check-in` |
| 闖關 | `https://familyday-greenworld.netlify.app/game` |

**QR 產生器（靜態碼，內容＝上列網址即可）：** 例如 [MakeQRCode](https://makeqrcode.app/)、[The Free QR Code Generator](https://the-free-qrcode-generator.com/)、需 Logo／印刷輸出時 [QRCode Monkey](https://www.qrcode-monkey.com/)。列印建議錯誤修正 **Q 或 H**，印出前務必實掃確認。

**方式 A：Netlify（建議）**

1. 登入 [Netlify](https://www.netlify.com/)，**Add new site → Import an existing project**，授權並選取本 GitHub 儲存庫。  
2. 建置設定由 [`netlify.toml`](netlify.toml) 帶入；若 UI 未帶出，手動確認 **Base directory = `source`**、`npm run build`、**Publish directory = `dist`**，並已設定 SPA 導向（子路徑重新整理可開）。  
3. 部署完成後將 **`https://…netlify.app`** 傳給預覽者。**勿設定 `VITE_BASE_PATH`**（`vite.config` 預設 `base: '/'`）。

**方式 B：GitHub Pages**

1. 將變更推上 GitHub 預設分支（如 `main`）。  
2. 儲存庫 **Settings → Pages**：**Build and deployment** 的 **Source** 選 **GitHub Actions**（首次需儲存設定）。  
3. 工作流程：[`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) 會在 `source/` 內建置，並設定 `VITE_BASE_PATH=/<repo名稱>/`，產物並複製 `index.html` 為 `404.html` 以利 SPA。  
4. 網址形如：`https://<你的帳號>.github.io/<repo名稱>/`（以實際帳號／倉庫名為準）。

**同區網快速試機（不經 Netlify／GitHub）**

在 `source/` 執行 `npm run dev -- --host`，以手機與電腦連同一 Wi‑Fi，手機瀏覽器開 `http://<電腦區網IP>:5173`（防火牆需允許該連接埠）。

<a id="ui-preview-screenshots"></a>

### 介面預覽（截圖）

以下為 **`source/` 生產建置**（`npm run build`）後，以 **390×844**（常見手機寬度）全頁截圖；與 [Netlify 測試站](#preview-netlify-test-ui)／本機 `npm run preview` **同一套輸出**。原始檔置於 [`docs/preview/screenshots/`](docs/preview/screenshots/)（重新產生步驟見 [`docs/preview/README.md`](docs/preview/README.md)）。

| 歡迎 `/` | 報到 `/checkin` |
| :---: | :---: |
| [![歡迎頁](docs/preview/screenshots/preview-welcome.png)](docs/preview/screenshots/preview-welcome.png) | [![報到表單](docs/preview/screenshots/preview-checkin-form.png)](docs/preview/screenshots/preview-checkin-form.png) |
| 闖關登入 `/register` | 闖關地圖 `/stage` |
| [![闖關登入](docs/preview/screenshots/preview-register.png)](docs/preview/screenshots/preview-register.png) | [![闖關地圖](docs/preview/screenshots/preview-stage.png)](docs/preview/screenshots/preview-stage.png) |

**領取成功**（`/finish/claimed`）— [![領取成功](docs/preview/screenshots/preview-claim-success.png)](docs/preview/screenshots/preview-claim-success.png)

---

## 專案概覽

### 專案簡介


| 項目     | 說明                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------- |
| 活動     | 新竹北埔**綠世界生態農場**；對象為**台北辦公室同仁及眷屬**（預估約 **1,000～1,300** 人）；活動日**確認中**（偏好**六月底**，或七月初）                       |
| 產品     | 解謎 Web 應用；同仁與家人體驗生態探索，完成關卡可至指定地點領取紀念品                                                                     |
| 提案／線框 PDF | `docs/proposals/FamilyDayApp_Proposal_v1.pdf`（v1，2026.04.10）、[`FamilyDayApp_wireframe_v2.pdf`](docs/proposals/FamilyDayApp_wireframe_v2.pdf)（線框 v2）；靜態圖另見 [`docs/design/wireframe/`](docs/design/wireframe/) |
| 需求主文件  | `docs/project/專案文件.md`（合併版：需求、待確認、狀態、技術）；索引見 `docs/README.md`                                             |
| 資訊開發人員 | Ken、Brian                                                                                                 |
| GitHub | [BrianChang1212/FamilyDay_GreenWorld](https://github.com/BrianChang1212/FamilyDay_GreenWorld)             |


### 文件來源與紀要


| 項目          | 內容                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| 需求筆記        | `d:\Brian\闖關遊戲,txt.ini`（已結構化寫入 `docs/`）                                                                               |
| 文件體系        | 詳見 `docs/README.md`（分類索引）→ `docs/project/專案文件.md`；`docs/proposals/`、`docs/design/` 等                                  |
| 最後更新 README | 2026-04-18（頁尾 **v2.35**）；細節見 [`docs/demo/README.md`](docs/demo/README.md)、[`docs/preview/`](docs/preview/)、[`docs/project/專案文件.md`](docs/project/專案文件.md) |


---

## Demo 影片預覽

內嵌播放與檔名、GitHub／本機預覽注意事項見 **[`docs/demo/README.md`](docs/demo/README.md)**。若下列路徑無檔案，請改點後援連結。

<video src="docs/demo/family-day-prototype-demo.mp4" controls playsinline width="100%" style="max-width:720px;border-radius:8px"></video>

**後援：** [family-day-prototype-demo.mp4](./docs/demo/family-day-prototype-demo.mp4) · [docs/demo](./docs/demo/)

---

## 技術架構


| 層級  | 內容                                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 前端  | Web UI；**已實作原型**：Vue 3 + Vite + TypeScript + Tailwind CSS + Vue Router（`source/`）；字體：Noto Sans TC／Noto Serif TC。**Naive UI** 仍為草案選項，**尚未**安裝；表單與版面以 Tailwind 自製為主；RWD |
| 後端  | **草案**：**FastAPI** + **PostgreSQL**（即時資料）；**Sheet** 輔助匯入／匯出（見 `docs/architecture/summary-backend.md`）                                                                 |
| 效能  | 約 1,300 人活動規模；**在線≠固定 RPS**；壓測見 `docs/architecture/summary-traffic.md`                                                                                                |


### 前端路由補充（原型）


| 路徑 | 說明 |
| --- | --- |
| `/check-in` | **報到 QR**：寫入意圖後導向 **`/checkin`**（單頁三欄＋確認彈窗→完成頁）。 |
| `/game` | **闖關入口 QR**：寫入意圖後導向 **`/` 歡迎頁**（再依序說明→登入→地圖）。 |
| `?entry=checkin` / `?entry=game` | 僅寫入 **`sessionStorage` 意圖**（`beforeEach`）；**不**等同開啟 `/check-in`／`/game` 的轉址；見 [`summary-frontend.md`](docs/architecture/summary-frontend.md) §2.1。 |
| `/register` | **闖關登入**（姓名／員編）；送出後 **`/stage`**。若意圖誤為報到則導向 **`/checkin`**。 |
| `/checkin` | **報到**單頁（姓名、員編、同行人數）＋確認彈窗；完成後僅 **`/checkin/complete`**。 |
| `/checkin/complete` | 報到完成頁；參加闖關須**另掃闖關 QR**（如 `/game`）。報到動線見 [`summary-frontend.md`](docs/architecture/summary-frontend.md) **§2.2**（含流程圖）。 |
| `/finish` | 完成頁保證領獎原型（`FinishView.vue`）：確認領獎彈窗。規格見 [`docs/project/專案文件.md`](docs/project/專案文件.md)、[`summary-frontend.md`](docs/architecture/summary-frontend.md)。 |
| `/finish/claimed` | 領取成功頁（`ClaimSuccessView.vue`）：已設定 **`VITE_API_BASE`** 時以 **`GET /api/v1/me/dashboard`** 呈現三格狀態；**未**設定時（含預覽站）以 **`local-fallback`**／`sessionStorage` 類比，畫面標示非伺服器紀錄；見 [`summary-frontend.md`](docs/architecture/summary-frontend.md) §2.1。 |


### 系統架構圖

以下為**邏輯架構**（實作可為自建 API、Serverless 或 Google Apps Script Web App 等，依 `docs/project/專案文件.md`「技術規格」定案）。**原型與產品準線：** **報到**與**闖關入口**為**不同 QR／URL**（見 [使用者流程](#使用者流程)）；報到完成後**不**自動進入闖關，須**另掃闖關 QR**（與舊版「簽到後直連闖關」示意圖不同）。**各關到站**以**現場關卡 QR code** 掃描由後端驗證（QR 內容須避免可被輕易偽造或重播；細節於技術規格定案）。

```mermaid
flowchart TB
  subgraph client["使用者端"]
    U[瀏覽器<br/>手機／平板／電腦]
  end

  subgraph entry["進場（兩類入口 · 分流）"]
    QR1[報到專用 QR／連結<br/>例如 /check-in]
    QR2[闖關入口 QR／連結<br/>例如 /game]
  end

  subgraph fe["前端 Web（同一 SPA · 不同路由）"]
    P1[簽到介面<br/>報到表單／完成頁]
    P2[闖關介面<br/>歡迎→說明→登入→地圖／答題…]
  end

  subgraph be["後端應用層"]
    API[API／應用服務<br/>驗證、業務規則、同步]
  end

  subgraph data["資料層"]
    GS[("Google Sheet<br/>名冊／出席／輕量統計")]
    DB[("Database<br/>闖關進度／兌獎／高併發寫入")]
  end

  subgraph onsite["現場（園區 · 各關卡）"]
    SQ[關卡 QR code<br/>立牌／現場布置]
  end

  U --> QR1
  U --> QR2
  QR1 --> P1
  QR2 --> P2
  P1 -.->|不自動銜接<br/>須另掃闖關 QR| QR2
  P1 --> API
  P2 --> API
  API --> GS
  API --> DB
  P2 -.->|掃描驗證到站| SQ
  SQ -.->|開啟／帶入關卡資訊| U
```



**主要資料流（摘要）**

```mermaid
sequenceDiagram
  autonumber
  participant U as 使用者
  participant FE as 前端
  participant API as 後端 API
  participant GS as Google Sheet
  participant DB as Database

  U->>FE: 開啟簽到 QR／連結
  FE->>API: 簽到（工號、姓名、同行人數）
  API->>GS: 查名冊、寫入出席
  API-->>FE: 報到結果

  U->>FE: 闖關：掃描該關 QR、作答
  FE->>API: 關卡／到站驗證（QR）／答案提交
  API->>DB: 讀寫闖關狀態、嘗試紀錄
  API->>GS: 選配：統計或稽核寫入
  API-->>FE: 關卡結果／可否兌獎

  FE->>API: 闖關禮兌換／核銷狀態（櫃檯佐證）
  API->>DB: 寫入兌獎紀錄
  API-->>FE: 兌換結果
```



---

## 規格與活動內容

### 已確認規格（摘要）


| 項目        | 規格                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------ |
| 預估人流      | 約 1,000～1,300 人                                                                                        |
| 範圍        | **本專案核心**：現場簽到 Web + 闖關遊戲 Web；**事前報名**預計用 Google 表單／企業維信表單（產出報名清冊 Excel，詳見 `docs/project/專案文件.md`）     |
| 平台        | Web UI（手機、平板、電腦瀏覽器）                                                                                    |
| 後端        | **草案**：**PostgreSQL** 扛即時簽到／闖關；**Google Sheet** 以報名清冊匯入／報表為主（見 `docs/architecture/summary-backend.md`） |
| 介面        | **簽到頁** + **闖關頁**（兩個獨立頁面／路由；**同一 Web App**；**報到**為 **`/checkin` 單頁**，**闖關**經 **`/register` 登入**；**報到 QR** 與**闖關 QR** 分流入，見 [使用者流程](#使用者流程)）                                                                              |
| 關卡        | 園內 **6 關**；到站掃**實體 QR**；題型建議**三選一**或圈選題（簡單有趣）                                                          |
| 名額／費用（報名） | **1+3**（員工 + 3 名眷屬）免費；**第 5 人起**須額外收費（標準見表單規則）                                                         |
| 闖關／獎項     | 一個工號**最多參加 3 次**，最多領 **3 份闖關紀念品**；完成六關後至**大草皮櫃檯**由工作人員驗證畫面領獎；**獎品限量、先到先選**                             |


### 六大闖關地點（主題區）

會議舉例：**水鳥區、天鵝湖**等六大主題區（與園區實地 QR 布點以**5 月下旬場勘**後定案）。先前提案亦曾列：大探奇區、水生植物公園、鳥園、蝴蝶園、生物多樣性探索區等，**以上併列供對照，以場勘與主辦最終配置為準**。

### 執行階段（摘要）


| 階段      | 內容                          | 狀態                             |
| ------- | --------------------------- | ------------------------------ |
| 流程與內容規劃 | 流程架構、UX、闖關機制                | 進行中                            |
| UI 設計   | Wireframe／主視覺（KV、CIS）與設計稿交付 | 待開始（**程式碼級介面**已在 `source/` 迭代） |
| 開發與測試   | 前後端、多裝置測試、兌獎與驗收             | 前端原型進行中；後端與 E2E 待開始            |


### 時程（0410 會議＋提案對照）

- **活動舉辦日**：確認中（偏好**六月底**，或**七月初**）；舊提案曾寫 5 月底前**完成開發**，仍以**活動日前驗收**為準。
- **主視覺**：目標 **4/17 前**確認，供設計素材。
- **流程／介面／文案**：**4/24 前**定案；並以**雙週會**追蹤進度。
- **實地場勘**：預計 **5 月下旬**綠世界場勘（關卡 QR 與動線）。

---

## 使用者流程

### QR 進入點與登入／表單（2026-04-18）

- **同一 Web 應用**內，簽到與闖關為**不同路由／畫面**。**闖關線**經 **`/register`（闖關登入）** 填姓名／員編；**報到線**經 **`/checkin` 單頁** 一次填姓名／員編／同行人數（**不**先走闖關登入頁）。  
- **掃報到用 QR**（或報到連結）→ **`/checkin`**（單頁＋確認彈窗）→ **報到完成頁**；**不**自動進入闖關。  
- **掃闖關入口 QR**（或遊戲連結）→ **`/` 歡迎** → 遊戲說明 → **`/register`** → **`/stage`**（細節見 [`summary-frontend.md`](docs/architecture/summary-frontend.md) §2.1）。  
- 各關**到站**仍掃**該關實體 QR** 進入題目；URL 應保留進入意圖與站點參數（登入流程不應遺失）。詳見 [`docs/project/專案文件.md`](docs/project/專案文件.md) §2.4、§4.1。  
- **待產品定案**：未完成報到者是否允許開始闖關（建議由路由或後端強制）。

### 事前報名（表單；非本 Web 專案本體）

- 平台：Google 表單或企業維信表單；產出報名清冊（如 Excel）。  
- 收集：工號、姓名、參加人數、**每位參加者**身分證字號與出生年月日（**保險**所需）、交通（是否搭遊覽車）、午餐桌次等。  
- 名額：**1+3** 免費；**第 5 人起**加收（表單須載明規則與收費標準）。

### 現場簽到

**流程圖（與線框步驟）：** [`docs/architecture/summary-frontend.md`](docs/architecture/summary-frontend.md) **§2.2**。

1. 掃描**報到專用 QR code**（或報到連結）進入應用程式（原型：`/check-in` → `/checkin`）  
2. 於**同一頁**填寫**姓名、員編、同行人數** → **確認彈窗** → 送出後僅 **`/checkin/complete`**，**不**連到闖關（**不**先經闖關用之 `/register`）  
3. **目的**：作為**補休假**核發憑證之一；並與**餐飲／門票**等預約數據核對  
4. 依**報名人數**領取第一份**報到禮**（現場動線）  
5. **闖關**：須**另掃闖關專用 QR**（如 `/game` 連結）才可進入闖關流程（與報到畫面分離）

### 闖關

**啟動**：掃描**闖關入口 QR**（或連結）進入；**與報到分開**（報到另掃報到 QR）。詳見 [`docs/project/專案文件.md`](docs/project/專案文件.md) **§3.1.1**、[`docs/architecture/summary-frontend.md`](docs/architecture/summary-frontend.md) **§2.3**（流程圖同節）。**報到**流程圖見同檔 **§2.2**。

**掃完闖關入口後 — 畫面順序（線框）**

1. **歡迎頁** → 2. **遊戲說明** → 3. **闖關登入頁**（**全屏表單**，非彈窗；標題常為「請輸入您的基本資料」）：僅 **姓名**、**員工編號**（**不含**報到之同行人數）→ **確定**後 **開始闖關**  
4. **每一關**：到站頁 → 掃**該關站點 QR** → **題目**（未選答案前不可確定）→ 答錯可**重答**／答對**下一關** → 至 6／6  
5. **完成闖關** → **領取闖關禮**（含確認彈窗、成功狀態；**工作人員**核銷）→ 與會議「大草皮櫃檯驗畫面」一致

**規則（0410 會議）**

- 題型：建議**三選一**或圈選題；**答錯可立即重答，直到答對為止**（鼓勵參與）。  
- 同一**工號**最多參加 **3 次**（眷屬分頭闖關或同人重複玩皆可），最多領 **3 份**闖關紀念品。  
- **獎項**：種類**限量**，採**先到先選**制。

---

## 設計資產與會議

**待取得（Action：@Fendy Wei／魏淑芬）**

1. 活動主視覺（Key Visual）— 目標 **4/17 前**確認
2. 企業識別：**Logo、印花圖樣、CIS** 等

**會議**

- 預計 **每週五 10:00** 開會（**A1 會議室**；以行事曆為準）。

**線框（靜態）** — [`docs/design/wireframe/`](docs/design/wireframe/)（畫面操作錄影見上節 [Demo 影片預覽](#demo-影片預覽)）。

---

## 待辦與進度

### 待確認（高優先級節錄）

完整清單見 `docs/project/專案文件.md`。會議後仍待主辦／表單補齊者例如：

1. 活動**確切日期**（六月底 vs 七月初）
2. 事前報名**表單欄位明細**、收費規則說明、保險文案
3. 簽到 QR 與闖關入口之**導覽與資安**（專屬 QR 發放方式）
4. 報名清冊與現場簽到／闖關後端之**資料切分與同步**

### 技術選型（草案已完成，待會議簽核）

細節見 `docs/project/專案文件.md`（開頭補充文件表）及 `docs/architecture/summary-*.md`。

1. **前端（草案簽核中；實作現況見上表）：** Vue 3 + Vite + TypeScript + Tailwind + Vue Router；**Naive UI** 可選、尚未納入 `package.json`
2. **Database（草案）：** PostgreSQL
3. **RWD：** 需要（手機優先）
4. **Sheet：** 匯入／匯出與同步時機（仍待確認）
5. **部署：** PaaS／Neon+Cloud Run／公司 DMZ 等（見 `docs/architecture/summary-deployment.md`）

### 專案進度（概覽）

整體約 **22%**（文件＋前端可跑原型；後端與正式測試尚未）。細項見 `docs/project/專案文件.md`「專案狀態」。


| 項目               | 狀態                                      |
| ---------------- | --------------------------------------- |
| 需求收集與整理          | 完成                                      |
| 技術選型             | 草案完成，待簽核                                |
| UI/UX 設計（設計稿／KV） | 未開始                                     |
| 開發               | **前端** `source/` 可建置與預覽（示範流程）；後端 API 未接 |
| 測試               | 未開始                                     |
| 部署               | 未開始                                     |


### 下一步（本週）

**高優先級**

- 需求確認會議（每週五 10:00、A1）  
- 收斂上述高優先級待確認事項  
- 請 Fendy（魏淑芬）提供識別元素（Logo、印花、CIS）；**KV 目標 4/17 前**  
- **4/24 前**收斂流程、App 介面與提示文案（搭配雙週會）

**中優先級**

- 會議**簽核**技術草案（`docs/specs/api-v0.1.md`、`docs/architecture/summary-*.md`）  
- 前端：`source/` 已初始化並可 `npm run dev`／`npm run build`（後端環境仍待簽核後建立）

---

## 儲存庫目錄結構


| 路徑                | 用途                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `docs/`           | 見 [`docs/README.md`](docs/README.md)（含 `project/`、`specs/`、`architecture/`、`demo/`、**`preview/`** 介面截圖等子目錄說明） |
| `assets/`         | 設計稿、KV、Logo、CIS（註明版本與來源）                                                                                          |
| `source/`         | 前端（Vue 3 + Vite + TS + Tailwind + Vue Router）：於此目錄執行 `npm install` → `npm run dev`（預設 `http://localhost:5173`）    |
| `.cursor/skills/` | Cursor Agent 用技能說明（前端設計、文案／在地化等）；選用，**非**執行期依賴                                                                    |
| `test/`           | 測試與驗收紀錄（**選用**；目前僅 **`.gitkeep`** 佔位，內容待補）                                                                               |
| `tool/`           | 建置、部署、一次性腳本（**選用**；目前僅 **`.gitkeep`** 佔位，內容待補）                                                                           |
| `graphify-out/`   | 圖譜／分析工具輸出（HTML／JSON／報告）；**已列於 `.gitignore`**，避免大量快取進版控                                                                 |


---

## 文件與維護

### 重要文件


| 類別           | 檔案                                                               |
| ------------ | ---------------------------------------------------------------- |
| 總覽           | `README.md`（本文件）                                                 |
| 文件索引         | `docs/README.md`（`docs/` 分類導覽）                                   |
| 詳細規格（單檔）     | `docs/project/專案文件.md`（需求、待確認、專案狀態、技術規格、提案來源、維護附錄）               |
| API 草案（v0.1） | `docs/specs/api-v0.1.md`（REST 端點、範例 JSON、畫面對照）                   |
| 前端討論總結       | `docs/architecture/summary-frontend.md`（Vue3／Vite／模組與 UX、API 銜接） |
| 後端討論總結       | `docs/architecture/summary-backend.md`（FastAPI／PostgreSQL、模型與安全） |
| 架設環境討論總結     | `docs/architecture/summary-deployment.md`（雲／內網／PaaS、區域與採購注意）     |
| 流量分析討論總結     | `docs/architecture/summary-traffic.md`（在線與 RPS、尖峰、限流、壓測）         |
| 提案／線框 PDF   | `docs/proposals/FamilyDayApp_Proposal_v1.pdf`、`FamilyDayApp_wireframe_v2.pdf` |
| 設計資產說明       | `assets/README.md`                                               |
| 操作示範錄影       | [`docs/demo/README.md`](docs/demo/README.md)（內嵌播放見本 README [Demo 影片預覽](#demo-影片預覽)） |


### 快速查找


| 你想…           | 請開                               |
| ------------- | -------------------------------- |
| 5 分鐘掌握專案      | 本 README                         |
| 系統架構與資料流圖     | 本 README [技術架構](#技術架構)（在 [Demo 影片預覽](#demo-影片預覽) 之後） |
| 完整需求、待辦、進度、技術 | `docs/project/專案文件.md`（內有章節目錄）   |
| 前後端與部署／流量定案摘要 | `docs/architecture/summary-*.md` |
| 畫面操作 Demo       | 本頁 [Demo 影片預覽](#demo-影片預覽)／[`docs/demo/README.md`](docs/demo/README.md) |


### 建議閱讀順序（角色）


| 角色    | 順序                                                 |
| ----- | -------------------------------------------------- |
| PM    | README → `docs/project/專案文件.md`（先「專案狀態」「待確認」再「需求」） |
| 開發    | README → `docs/project/專案文件.md`（先「技術規格」再「需求」）      |
| UI/UX | README → `docs/project/專案文件.md`（「需求與流程」「待確認」）      |
| 測試    | README → `docs/project/專案文件.md`（「需求」「技術規格」）        |


### 文件更新頻率（建議）


| 文件                     | 時機                                             |
| ---------------------- | ---------------------------------------------- |
| `README.md`            | 重大變更、里程碑                                       |
| `docs/project/專案文件.md` | 需求／技術／會議／進度任一變更時（更新對應章節）；新路徑見 `docs/README.md` |


---

*README v2.35 · 2026-04-18（開頭主視覺：`source/public/images/family-day-forest-walk.png`；v2.34）*