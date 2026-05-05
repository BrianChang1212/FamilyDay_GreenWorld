# Firebase 相關檔案分類索引

> **目的：** 一眼找到「Firebase CLI／Firestore／Functions／Hosting／本機腳本」對應檔案，並說明**為何部分檔案必須留在倉庫根目錄**。

---

## 1. Firebase CLI 工作目錄：`familyday-backend/`

執行 `firebase deploy`、`firebase emulators:start` 時，CLI 預設讀取**當前目錄**的 `firebase.json`、`.firebaserc`。Firebase 相關設定檔已移至 `familyday-backend/`，請在該目錄下執行相關指令。

| 檔案 | 角色 |
|------|------|
| [`familyday-backend/firebase.json`](../../familyday-backend/firebase.json) | Hosting（`familyday-frontend/dist`）、Functions 來源目錄、Firestore 規則／索引路徑、**emulator 埠** |
| [`familyday-backend/.firebaserc`](../../familyday-backend/.firebaserc) | 別名與預設 **Firebase 專案 ID**（與 [`fdgw.project.json`](../../fdgw.project.json) 的 `firebaseProjectId` 請保持一致） |
| [`familyday-backend/firestore.rules`](../../familyday-backend/firestore.rules) | Firestore Security Rules |
| [`familyday-backend/firestore.indexes.json`](../../familyday-backend/firestore.indexes.json) | 複合索引定義 |

**部署指令習慣：** 在 **`familyday-backend/`** 目錄執行，例如 `firebase deploy --only firestore`、`firebase deploy --only functions:api`；細節見 [`architecture/firestore-schema-v1.md`](../architecture/firestore-schema-v1.md) §1.2、[`setup/local-firestore-gcp.md`](../setup/local-firestore-gcp.md)。

---

## 2. 產品／工具常數（與 Firebase 專案對齊）

| 檔案 | 角色 |
|------|------|
| [`fdgw.project.json`](../../fdgw.project.json) | **非 CLI 格式**：專案 ID、區域、emulator host/port（給 Vite／Node 腳本）、`eventId`、CORS、遊戲／dashboard／seed／smoke 預設等 |

**與 `familyday-backend/firebase.json` 的關係：** Functions **deploy 區域**以 `familyday-backend/src/index.ts`（讀取 `fdgw`）與實際 GCP 設定為準；**本機 emulator 埠**同時出現在 `familyday-backend/firebase.json` 與 `fdgw.project.json` 時，變更請**兩邊對齊**（或僅改 `familyday-backend/firebase.json` 後同步 `fdgw` 的 `functionsEmulatorPort`）。

---

## 3. 一鍵本機（Windows）

| 檔案 | 角色 |
|------|------|
| [`scripts/dev-oneclick.ps1`](../../scripts/dev-oneclick.ps1) | 安裝依賴、`.env.local`、**`cloud-firestore-dev -FunctionsOnly` serve**、再啟動 Vite（見根 `README`） |
| [`scripts/dev-oneclick.cmd`](../../scripts/dev-oneclick.cmd) | 雙擊／cmd 包裝，呼叫上述 ps1 |

---

## 4. Cloud Functions（後端執行碼）

| 路徑 | 角色 |
|------|------|
| [`familyday-backend/src/`](../../familyday-backend/src/) | Express API、`firebase-functions` 匯出、`firebase-admin`、Firestore 存取 |
| [`familyday-backend/src/config/fdgwProject.ts`](../../familyday-backend/src/config/fdgwProject.ts) | 讀取根目錄 `fdgw.project.json`（執行時路徑相對於編譯輸出） |
| [`familyday-backend/package.json`](../../familyday-backend/package.json) | `build`、`serve`（emulator）、`deploy`、`verify:firestore`、`seed:roster` 等 |
| [`familyday-backend/scripts/`](../../familyday-backend/scripts/) | `cloud-firestore-dev.ps1`、`verify-firestore-flow.mjs`、`smoke-api.mjs`、seed／purge |

---

## 5. 前端（與 Firebase Hosting／API 串接）

| 路徑 | 角色 |
|------|------|
| [`familyday-frontend/`](../../familyday-frontend/) | Vue 3 前端；建置產物供 Hosting 或 Netlify／GitHub Pages |
| [`familyday-frontend/vite.config.ts`](../../familyday-frontend/vite.config.ts) | 讀 `fdgw.project.json` 設定 dev proxy 至 Functions emulator |
| 環境變數 `VITE_API_BASE` | 指向正式／測試 **HTTPS API 根**（見 [`architecture/summary-frontend.md`](../architecture/summary-frontend.md) §4） |

---

## 6. 架構與操作文件（非執行檔）

| 檔案 | 角色 |
|------|------|
| [`architecture/firestore-schema-v1.md`](../architecture/firestore-schema-v1.md) | 集合、欄位、Rules／索引與部署指令 |
| [`architecture/summary-backend.md`](../architecture/summary-backend.md) | 後端策略、本機服務帳戶 §2.0 |
| [`architecture/summary-deployment.md`](../architecture/summary-deployment.md) | Firebase 主線、多環境、預算與流程 |
| [`setup/local-firestore-gcp.md`](../setup/local-firestore-gcp.md) | 金鑰、seed、purge、與根目錄設定檔之關係 |

---

## 7. 若堅持「物理分類」到子資料夾

可行但**需全專案改指令**：例如 `firebase deploy --config config/firebase/firebase.json`，且 `firebase.json` 內所有相對路徑要改為以該檔所在目錄為基準重新計算。本 repo 以 `familyday-backend/` 為 Firebase CLI 工作目錄，相關設定已集中於此。

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-05-05 | 初稿：Firebase 相關檔案分類與根目錄保留原因 |
| 1.1 | 2026-05-05 | **§3**：`scripts/dev-oneclick` 一鍵本機；後續節號遞延 |
