# `docs/` 文件索引

本目錄依**用途分類**；維護主文件仍為 [`project/專案文件.md`](./project/專案文件.md)。

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

1. **安裝 Node.js 與 npm**、**PATH 更新**、**`npm install`**：見倉庫根目錄 [`README.md`「快速開始」](../README.md#快速開始) 內 **Windows：安裝 Node.js 與 npm（winget）** 小節（含 Error 1925、`--scope user`、同一終端機刷新 PATH 等）。  
2. **啟動前端**：於 `source/` 執行 `npm run dev`（細節同上節與根 README）。  
3. **前端單元測試**：於 `source/` 執行 `npm run test`（Vitest；檔案 **`source/src/**/*.test.ts`**）；CI 見根目錄 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)。

---

## 快速連結

| 想找… | 檔案 |
|--------|------|
| 需求與專案狀態 | [`project/專案文件.md`](./project/專案文件.md) |
| API v0.1 草案 | [`specs/api-v0.1.md`](./specs/api-v0.1.md) |
| API 整合驗證清單 | [`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md) |
| Mock API 驗證流程 | [`testing/mock-api-test-plan.md`](./testing/mock-api-test-plan.md) |
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

**最後整理：** 2026-04-28。歷史變更與實作細節請以**各檔案標頭**、根目錄 **`README.md`** 頁尾版本列、以及 **`project/專案文件.md`**（合併版 **v1.3.28**）為準；**測試 Web UI** 見根 [`README.md`](../README.md#preview-netlify-test-ui)；**Vitest** 單元測試見上表與 `summary-frontend.md` **§1.1**（**v1.26**）；前端路由、`VITE_API_BASE`、`local-fallback`、`constants`／`i18n` 集中化、**`views/`** 分群與 **`api/`／`composables` 分層**見 `architecture/summary-frontend.md`（§2.1、§2，**v1.26**）；後端／流量摘要見 `architecture/summary-backend.md`（**v1.5**）、`architecture/summary-traffic.md`（**v1.2**）；部署摘要見 `architecture/summary-deployment.md` §1.1（修訂至 **v1.5**）；`specs/api-v0.1.md` 修訂至 **v0.1.8**；API 整合驗證清單見 [`testing/api-integration-checklist.md`](./testing/api-integration-checklist.md)。
