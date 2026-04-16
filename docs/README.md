# `docs/` 文件索引

本目錄依**用途分類**；維護主文件仍為 [`project/專案文件.md`](./project/專案文件.md)。

---

## 目錄結構

| 資料夾 | 用途 |
|--------|------|
| [`project/`](./project/) | **專案主文件**（需求、會議、待確認、狀態、技術規格合併版） |
| [`specs/`](./specs/) | **介面規格**（REST API 草案等） |
| [`architecture/`](./architecture/) | **架構討論總結**（前後端技術選型、部署、流量） |
| [`proposals/`](./proposals/) | **外部提案／簡報**（PDF） |
| [`design/`](./design/) | **設計資產**（線框圖等） |
| [`demo/`](./demo/) | **操作示範錄影**（MP4 等；不隨前端建置打包，見 [`demo/README.md`](./demo/README.md)） |
| `zip/` | 壓縮備份（如線框 zip）；非正式規格來源時以展開檔為準 |

---

## 開發環境（Windows／Node）

1. **安裝 Node.js 與 npm**、**PATH 更新**、**`npm install`**：見倉庫根目錄 [`README.md`「快速開始」](../README.md#快速開始) 內 **Windows：安裝 Node.js 與 npm（winget）** 小節（含 Error 1925、`--scope user`、同一終端機刷新 PATH 等）。  
2. **啟動前端**：於 `source/` 執行 `npm run dev`（細節同上節與根 README）。

---

## 快速連結

| 想找… | 檔案 |
|--------|------|
| 需求與專案狀態 | [`project/專案文件.md`](./project/專案文件.md) |
| API v0.1 草案 | [`specs/api-v0.1.md`](./specs/api-v0.1.md) |
| 前端／後端／部署／流量摘要 | [`architecture/summary-frontend.md`](./architecture/summary-frontend.md) 等 |
| 提案 PDF | [`proposals/FamilyDayApp_Proposal_v1.pdf`](./proposals/FamilyDayApp_Proposal_v1.pdf) |
| Wireframe PNG | [`design/wireframe/`](./design/wireframe/) |
| 操作示範錄影 | [`demo/`](./demo/)（[`demo/README.md`](./demo/README.md)） |

---

## 根目錄 README

對外總覽與表格連結請見倉庫根目錄 [`README.md`](../README.md)（內含已更新之路徑）。

---

**最後整理：** 2026-04-16。歷史變更與實作細節請以**各檔案標頭**、根目錄 **`README.md`** 頁尾版本列、以及 **`project/專案文件.md`** 為準（含 **`/finish`**、`demo/` 等；見 `architecture/summary-frontend.md` v1.2）。
