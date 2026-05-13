# `docs/` 文件索引

本目錄依**用途分類**；自 2026-05 起核心程式已拆為二個子開發樹：
`familyday-frontend/`、`familyday-backend/`；**REST v0.1 契約與 changelog** 在 **`docs/api/`**。
維護主文件仍為 [`project/project-master.md`](./project/project-master.md)。

---

## 目錄結構

| 資料夾 | 用途 |
|--------|------|
| [`api/`](./api/) | **`api/api-v0.1.md`**（契約正文）· **`api/CHANGELOG.md`**（變更紀錄）· [`api/README.md`](./api/README.md) |
| [`overview/`](./overview/) | **根 README 補充**（[`root-readme-supplement.md`](./overview/root-readme-supplement.md)：截圖、Mermaid、目錄表、長篇待辦） |
| [`project/`](./project/) | **專案主文件**（需求、會議、待確認、狀態、技術規格合併版） |
| [`project/repo-split-migration.md`](./project/repo-split-migration.md) | **拆分邊界**遷移敘事：**前後端**執行樹 + **`docs/api/`** 契約／changelog；cutover |
| [`architecture/`](./architecture/) | **架構討論總結**（[`system-architecture.md`](./architecture/system-architecture.md) 全系統圖、前後端選型、部署、流量） |
| [`testing/`](./testing/) | **整合驗證清單**（前後端 API 實測流程與驗收 Checklist） |
| [`setup/`](./setup/) | **本機與預覽**（GCP／Firestore、靜態預覽、Windows Node.js；詳見 [`setup/README.md`](./setup/README.md)）；**上架疑難**見 [`functions-deploy-incident-report-2026-05-11.md`](./setup/functions-deploy-incident-report-2026-05-11.md) |
| [`firebase/`](./firebase/) | **Firebase 檔案分類索引**（`familyday-backend/firebase.json`、`familyday-backend/.firebaserc`、Rules、Functions、與 `fdgw.project.json` 關係；詳見 [`firebase/README.md`](./firebase/README.md)） |
| [`proposals/`](./proposals/) | **外部提案／簡報**（PDF） |
| [`media/`](./media/) | **媒體索引**：介面截圖為同層 **`FamilyDay_GreenWorld_UI_Screenshots`**（見 [`media/README.md`](./media/README.md)） |
| `zip/` | 壓縮備份（如線框 zip）；非正式規格來源時以展開檔為準 |

---

## 開發環境（Windows／Node）

- **最短路徑：** 根目錄 [`README.md`](../README.md#quick-start)（`npm run dev`、測試、CI）。  
- **前端 + API + 雲端 Firestore（Windows 一鍵）：** [`setup/README.md`](./setup/README.md)、[`setup/local-firestore-gcp.md`](./setup/local-firestore-gcp.md)；根 [`README.md`](../README.md) 僅保留最短摘要。
- **詳細：** [`setup/README.md`](./setup/README.md)（Firestore／GCP、靜態預覽、Windows Node 疑難排解）。

---

## 快速連結

| 想找… | 檔案 |
|--------|------|
| **全系統架構圖（前端 + API + 後端）** | [`architecture/system-architecture.md`](./architecture/system-architecture.md) |
| 需求與專案狀態 | [`project/project-master.md`](./project/project-master.md) |
| API v0.1（`docs/` 維護） | [`api/api-v0.1.md`](./api/api-v0.1.md)、[`api/CHANGELOG.md`](./api/CHANGELOG.md)、[`api/README.md`](./api/README.md)（含 **`contract-v*`** 標籤約定）；審查指派見根 **`.github/CODEOWNERS`** |
| API 整合清單（精簡） | [`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md) |
| API Mock 測試流程 | [`testing/api-mock-testing.md`](./testing/api-mock-testing.md) |
| API 歷史驗證紀錄 | [`testing/api-integration-history.md`](./testing/api-integration-history.md) |
| 本機 GCP 服務帳戶（Firestore／verify） | [`setup/local-firestore-gcp.md`](./setup/local-firestore-gcp.md)；[`architecture/summary-backend.md`](./architecture/summary-backend.md) **§2.0** |
| **Cloud Functions 首次部署問題處理報告**（IAM、路徑、Invoker、`.env`） | [`setup/functions-deploy-incident-report-2026-05-11.md`](./setup/functions-deploy-incident-report-2026-05-11.md) |
| **正式 Hosting 報到／闖關入口 URL**（QR 用） | [`setup/hosting-public-entry-urls.md`](./setup/hosting-public-entry-urls.md) |
| **正式 Hosting：`VITE_API_BASE` 本機誤Embed／連線錯誤** | [`setup/hosting-production-api-base-incident-2026-05-12.md`](./setup/hosting-production-api-base-incident-2026-05-12.md) |
| **iOS／跨網域：Bearer 登入與 `sessionStorage`** | [`setup/ios-mobile-auth-fix-2026-05-13.md`](./setup/ios-mobile-auth-fix-2026-05-13.md) |
| Firebase 相關檔案分類（`familyday-backend/` 設定 vs fdgw） | [`firebase/README.md`](./firebase/README.md) |
| 前端／後端／部署／流量摘要 | [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) 等 |
| 根 README 補充（截圖／技術圖／目錄表／長篇待辦） | [`overview/root-readme-supplement.md`](./overview/root-readme-supplement.md) |
| 測試 Web UI（Netlify、QR） | [`setup/static-preview-netlify-github.md`](./setup/static-preview-netlify-github.md)；錨點 [`overview/root-readme-supplement.md#preview-netlify-test-ui`](./overview/root-readme-supplement.md#preview-netlify-test-ui)；[`summary-deployment.md`](./architecture/summary-deployment.md) **§1.1**（**v1.6**） |
| 前端單元測試（Vitest） | `familyday-frontend/`：`npm run test`；規格見 [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) **§1.1**（**v1.33**） |
| 提案／線框 PDF | [`proposals/FamilyDayApp_Proposal_v1.pdf`](./proposals/FamilyDayApp_Proposal_v1.pdf)；[`proposals/FamilyDayApp_wireframe_v2.pdf`](./proposals/FamilyDayApp_wireframe_v2.pdf) |
| 介面截圖索引（PNG 在同層 `FamilyDay_GreenWorld_UI_Screenshots`） | [`media/README.md`](./media/README.md) |

---

## 根目錄 README

根目錄 [`README.md`](../README.md) 為**精簡總覽**（快速開始、即時進度、待辦摘要、舊錨點對照）。**長文、截圖、Mermaid、目錄表**見 [`overview/root-readme-supplement.md`](./overview/root-readme-supplement.md)。

---

**最後整理：** 2026-05-13 · **完整同步**（根 **`README` v2.76**、**`project-master` v1.3.52**、**`api-v0.1` v0.1.25–v0.1.26**、**`system-architecture` v1.4**、**`summary-frontend` v1.34**／**`summary-backend`**、**`overview/root-readme-supplement`**、`api-integration-checklist`、`setup`／本索引）。沿革：**2026-05-11**（**刪除 `familyday-api-contract/`**；契約治理收斂 **`docs/api/README.md`**＋根 **`.github/CODEOWNERS`**。REST **規格**與**契約 CHANGELOG** 於 **`docs/api/`**。**`docs/specs` 已移除**—**`repo-split-boundary` → `repo-split-migration`**；刪空 **`docs/migration/`**；**`docs/design` 已移除**（早期線框 PNG；靜態線框見 **`proposals/FamilyDayApp_wireframe_v2.pdf`**、實作畫面 PNG 改由同層 **`FamilyDay_GreenWorld_UI_Screenshots`** 維護；**`tool/capture-preview-screenshots.ps1`**／**`docs/preview/screenshots`** 約定已停止使用）。早先同日（**`api-v0.1` v0.1.22**：契約 Mock／MVP 路徑對齊 `familyday-frontend/mock`、`familyday-backend/`；根 **README** v2.58 同步 API 函式／Vitest 檔數）。2026-05-05（續：**`api-v0.1` v0.1.21**／**`summary-frontend` v1.31** 版本鏈；**`api-v0.1`** CORS／`eventId` 對齊 `fdgw`；**checklist** §7.1 歷史表加對照說明、儀表板 curl 註記 mock 8787；根 **README** 埠號指向 `fdgw.frontend`；**`project-master` v1.3.33**）。先前同日：**`firebase/`** 索引；**`dev-oneclick`**；**`local-firestore-gcp`／checklist／summary-backend`** 與 `-FunctionsOnly`。再前：2026-05-03（**`setup/`**；**`summary-deployment` v1.6**；**`api-v0.1` v0.1.20**；**`summary-frontend` v1.30**）。**`api-v0.1`** 已於 2026-05-05 遞增至 **v0.1.21**，**`summary-frontend`** 至 **v1.31**（見本日「續」條目）。版本與修訂歷史以各檔案檔頭及
[`project/project-master.md`](./project/project-master.md) 頁尾版本列為準。
技術細節請直接查閱對應單一來源文件：前端
[`architecture/summary-frontend.md`](./architecture/summary-frontend.md)、後端
[`architecture/summary-backend.md`](./architecture/summary-backend.md)、部署
[`architecture/summary-deployment.md`](./architecture/summary-deployment.md)、流量
[`architecture/summary-traffic.md`](./architecture/summary-traffic.md)、API
[`api/api-v0.1.md`](./api/api-v0.1.md)、[`api/CHANGELOG.md`](./api/CHANGELOG.md)、整合驗證
[`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md)；
測試 Web UI 見 [`setup/static-preview-netlify-github.md`](./setup/static-preview-netlify-github.md) 或 [`overview/root-readme-supplement.md#preview-netlify-test-ui`](./overview/root-readme-supplement.md#preview-netlify-test-ui)。
