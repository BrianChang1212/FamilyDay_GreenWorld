# `docs/` 文件索引

本目錄依**用途分類**；自 2026-05 起核心程式已拆為三個子 repo：
`familyday-frontend/`、`familyday-backend/`、`familyday-api-contract/`。
維護主文件仍為 [`project/project-master.md`](./project/project-master.md)。

---

## 目錄結構

| 資料夾 | 用途 |
|--------|------|
| [`project/`](./project/) | **專案主文件**（需求、會議、待確認、狀態、技術規格合併版） |
| [`specs/`](./specs/) | **舊版介面規格快照**（目前正式契約維護於 `familyday-api-contract/`） |
| [`architecture/`](./architecture/) | **架構討論總結**（前後端技術選型、部署、流量） |
| [`testing/`](./testing/) | **整合驗證清單**（前後端 API 實測流程與驗收 Checklist） |
| [`setup/`](./setup/) | **本機與預覽**（GCP／Firestore、靜態預覽、Windows Node.js；詳見 [`setup/README.md`](./setup/README.md)） |
| [`firebase/`](./firebase/) | **Firebase 檔案分類索引**（`familyday-backend/firebase.json`、`familyday-backend/.firebaserc`、Rules、Functions、與 `fdgw.project.json` 關係；詳見 [`firebase/README.md`](./firebase/README.md)） |
| [`proposals/`](./proposals/) | **外部提案／簡報**（PDF） |
| [`design/`](./design/) | **設計資產**（線框圖等） |
| [`media/`](./media/) | **媒體索引**（整合 Demo 錄影與 Preview 截圖維護說明） |
| [`demo/`](./demo/) | Demo 影片檔案目錄（規範改由 [`media/README.md`](./media/README.md) 維護） |
| [`preview/`](./preview/) | Preview 截圖檔案目錄（重產步驟改由 [`media/README.md`](./media/README.md) 維護） |
| `zip/` | 壓縮備份（如線框 zip）；非正式規格來源時以展開檔為準 |

---

## 開發環境（Windows／Node）

- **最短路徑：** 根目錄 [`README.md`](../README.md#快速開始)（`npm run dev`、測試、CI）。  
- **前端 + API + 雲端 Firestore（Windows 一鍵）：** 根 [`README.md`](../README.md) **「Windows：一鍵啟動」**、`scripts/dev-oneclick.ps1`。  
- **詳細：** [`setup/README.md`](./setup/README.md)（Firestore／GCP、靜態預覽、Windows Node 疑難排解）。

---

## 快速連結

| 想找… | 檔案 |
|--------|------|
| 需求與專案狀態 | [`project/project-master.md`](./project/project-master.md) |
| API v0.1 草案（現行） | [`../familyday-api-contract/api-v0.1.md`](../familyday-api-contract/api-v0.1.md) |
| API v0.1 草案（歷史快照） | [`specs/api-v0.1.md`](./specs/api-v0.1.md) |
| Firestore Schema（v1 草案） | [`architecture/firestore-schema-v1.md`](./architecture/firestore-schema-v1.md) |
| API 整合清單（精簡） | [`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md) |
| API Mock 測試流程 | [`testing/api-mock-testing.md`](./testing/api-mock-testing.md) |
| API 歷史驗證紀錄 | [`testing/api-integration-history.md`](./testing/api-integration-history.md) |
| 本機 GCP 服務帳戶（Firestore／verify） | [`setup/local-firestore-gcp.md`](./setup/local-firestore-gcp.md)；[`architecture/summary-backend.md`](./architecture/summary-backend.md) **§2.0** |
| Firebase 相關檔案分類（`familyday-backend/` 設定 vs fdgw） | [`firebase/README.md`](./firebase/README.md) |
| 前端／後端／部署／流量摘要 | [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) 等 |
| 測試 Web UI（Netlify、QR） | [`setup/static-preview-netlify-github.md`](./setup/static-preview-netlify-github.md)；根 [`README`](../README.md#preview-netlify-test-ui) 錨點 **`preview-netlify-test-ui`**；[`summary-deployment.md`](./architecture/summary-deployment.md) **§1.1**（**v1.6**） |
| 前端單元測試（Vitest） | `familyday-frontend/`：`npm run test`；規格見 [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) **§1.1**（**v1.31**） |
| 提案 PDF | [`proposals/FamilyDayApp_Proposal_v1.pdf`](./proposals/FamilyDayApp_Proposal_v1.pdf) |
| Wireframe PNG | [`design/wireframe/`](./design/wireframe/) |
| 操作示範錄影與截圖維護 | [`media/README.md`](./media/README.md) |

---

## 根目錄 README

對外總覽與表格連結請見倉庫根目錄 [`README.md`](../README.md)（內含已更新之路徑）。

---

**最後整理：** 2026-05-05（續：**`api-v0.1` v0.1.21**／**`summary-frontend` v1.31** 版本鏈；**`api-v0.1`** CORS／`eventId` 對齊 `fdgw`；**checklist** §7.1 歷史表加對照說明、儀表板 curl 註記 mock 8787；根 **README** 埠號指向 `fdgw.frontend`；**`project-master` v1.3.33**）。先前同日：**`firebase/`** 索引；**`dev-oneclick`**；**`local-firestore-gcp`／checklist／summary-backend`** 與 `-FunctionsOnly`。再前：2026-05-03（**`setup/`**；**`summary-deployment` v1.6**；**`api-v0.1` v0.1.20**；**`summary-frontend` v1.30**）。**`api-v0.1`** 已於 2026-05-05 遞增至 **v0.1.21**，**`summary-frontend`** 至 **v1.31**（見本日「續」條目）。版本與修訂歷史以各檔案檔頭及
[`project/project-master.md`](./project/project-master.md) 頁尾版本列為準。
技術細節請直接查閱對應單一來源文件：前端
[`architecture/summary-frontend.md`](./architecture/summary-frontend.md)、後端
[`architecture/summary-backend.md`](./architecture/summary-backend.md)、部署
[`architecture/summary-deployment.md`](./architecture/summary-deployment.md)、流量
[`architecture/summary-traffic.md`](./architecture/summary-traffic.md)、API
[`specs/api-v0.1.md`](./specs/api-v0.1.md)、整合驗證
[`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md)；
測試 Web UI 見 [`setup/static-preview-netlify-github.md`](./setup/static-preview-netlify-github.md) 或根 [`README`](../README.md#preview-netlify-test-ui)。
