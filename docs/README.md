# `docs/` 文件索引

本目錄依**用途分類**；維護主文件仍為
[`project/project-master.md`](./project/project-master.md)。

---

## 目錄結構

| 資料夾 | 用途 |
|--------|------|
| [`project/`](./project/) | **專案主文件**（需求、會議、待確認、狀態、技術規格合併版） |
| [`specs/`](./specs/) | **介面規格**（REST API 草案等） |
| [`architecture/`](./architecture/) | **架構討論總結**（前後端技術選型、部署、流量） |
| [`testing/`](./testing/) | **整合驗證清單**（前後端 API 實測流程與驗收 Checklist） |
| [`proposals/`](./proposals/) | **外部提案／簡報**（PDF） |
| [`design/`](./design/) | **設計資產**（線框圖等） |
| [`media/`](./media/) | **媒體索引**（整合 Demo 錄影與 Preview 截圖維護說明） |
| [`demo/`](./demo/) | Demo 影片檔案目錄（規範改由 [`media/README.md`](./media/README.md) 維護） |
| [`preview/`](./preview/) | Preview 截圖檔案目錄（重產步驟改由 [`media/README.md`](./media/README.md) 維護） |
| `zip/` | 壓縮備份（如線框 zip）；非正式規格來源時以展開檔為準 |

---

## 開發環境（Windows／Node）

開發指令與環境設定以根目錄 [`README.md`](../README.md#快速開始) 為單一來源（含
Windows 安裝、`npm run dev`、`npm run test`、CI 流程）。

---

## 快速連結

| 想找… | 檔案 |
|--------|------|
| 需求與專案狀態 | [`project/project-master.md`](./project/project-master.md) |
| API v0.1 草案 | [`specs/api-v0.1.md`](./specs/api-v0.1.md) |
| Firestore Schema（v1 草案） | [`architecture/firestore-schema-v1.md`](./architecture/firestore-schema-v1.md) |
| API 整合與 Mock 驗證清單 | [`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md) |
| 前端／後端／部署／流量摘要 | [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) 等 |
| 測試 Web UI（Netlify、QR） | 根 [`README.md`](../README.md#preview-netlify-test-ui)（錨點 **`preview-netlify-test-ui`**）；部署摘要 [`architecture/summary-deployment.md`](./architecture/summary-deployment.md) **§1.1**（**v1.5**） |
| 前端單元測試（Vitest） | `source/`：`npm run test`；規格見 [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) **§1.1**（**v1.26**）；CI 見 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| 提案 PDF | [`proposals/FamilyDayApp_Proposal_v1.pdf`](./proposals/FamilyDayApp_Proposal_v1.pdf) |
| Wireframe PNG | [`design/wireframe/`](./design/wireframe/) |
| 操作示範錄影與截圖維護 | [`media/README.md`](./media/README.md) |

---

## 根目錄 README

對外總覽與表格連結請見倉庫根目錄 [`README.md`](../README.md)（內含已更新之路徑）。

---

**最後整理：** 2026-04-28。版本與修訂歷史以各檔案檔頭及
[`project/project-master.md`](./project/project-master.md) 頁尾版本列為準。
技術細節請直接查閱對應單一來源文件：前端
[`architecture/summary-frontend.md`](./architecture/summary-frontend.md)、後端
[`architecture/summary-backend.md`](./architecture/summary-backend.md)、部署
[`architecture/summary-deployment.md`](./architecture/summary-deployment.md)、流量
[`architecture/summary-traffic.md`](./architecture/summary-traffic.md)、API
[`specs/api-v0.1.md`](./specs/api-v0.1.md)、整合驗證
[`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md)；
測試 Web UI 見根 [`README.md`](../README.md#preview-netlify-test-ui)。
