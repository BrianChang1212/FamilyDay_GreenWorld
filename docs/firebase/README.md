# Firebase 相關檔案分類索引

> **目的：** 一眼找到「Firebase CLI／Firestore／Functions／Hosting／本機腳本」對應檔案，並說明**為何部分檔案必須留在倉庫根目錄**。

---

## 1. 建議維持現狀：根目錄（Firebase CLI 預設工作目錄）

執行 `firebase deploy`、`firebase emulators:start` 時，CLI 預設讀取**當前目錄**的 `firebase.json`、`.firebaserc`。將它們移到子目錄須改為每次指定 `--config`／工作目錄，易與文件、CI 不一致，**本專案不建議搬移**。

| 檔案 | 角色 |
|------|------|
| [`firebase.json`](../../firebase.json) | Hosting（`source/dist`）、Functions 來源目錄、Firestore 規則／索引路徑、**emulator 埠** |
| [`.firebaserc`](../../.firebaserc) | 別名與預設 **Firebase 專案 ID**（與 [`fdgw.project.json`](../../fdgw.project.json) 的 `firebaseProjectId` 請保持一致） |
| [`firestore.rules`](../../firestore.rules) | Firestore Security Rules |
| [`firestore.indexes.json`](../../firestore.indexes.json) | 複合索引定義 |

**部署指令習慣：** 在倉庫**根目錄**執行，例如 `firebase deploy --only firestore`、`firebase deploy --only functions:api`；細節見 [`architecture/firestore-schema-v1.md`](../architecture/firestore-schema-v1.md) §1.2、[`setup/local-firestore-gcp.md`](../setup/local-firestore-gcp.md)。

---

## 2. 產品／工具常數（與 Firebase 專案對齊）

| 檔案 | 角色 |
|------|------|
| [`fdgw.project.json`](../../fdgw.project.json) | **非 CLI 格式**：專案 ID、區域、emulator host/port（給 Vite／Node 腳本）、`eventId`、CORS、遊戲／dashboard／seed／smoke 預設等 |

**與 `firebase.json` 的關係：** Functions **deploy 區域**以 `functions/src/index.ts`（讀取 `fdgw`）與實際 GCP 設定為準；**本機 emulator 埠**同時出現在 `firebase.json` 與 `fdgw.project.json` 時，變更請**兩邊對齊**（或僅改 `firebase.json` 後同步 `fdgw` 的 `functionsEmulatorPort`）。

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
| [`functions/src/`](../../functions/src/) | Express API、`firebase-functions` 匯出、`firebase-admin`、Firestore 存取 |
| [`functions/src/config/fdgwProject.ts`](../../functions/src/config/fdgwProject.ts) | 讀取根目錄 `fdgw.project.json`（執行時路徑相對於編譯輸出） |
| [`functions/package.json`](../../functions/package.json) | `build`、`serve`（emulator）、`deploy`、`verify:firestore`、`seed:roster` 等 |
| [`functions/scripts/`](../../functions/scripts/) | `cloud-firestore-dev.ps1`、`verify-firestore-flow.mjs`、`smoke-api.mjs`、seed／purge |

---

## 5. 前端（與 Firebase Hosting／API 串接）

| 路徑 | 角色 |
|------|------|
| [`source/`](../../source/) | Vue 3 前端；建置產物供 Hosting 或 Netlify／GitHub Pages |
| [`source/vite.config.ts`](../../source/vite.config.ts) | 讀 `fdgw.project.json` 設定 dev proxy 至 Functions emulator |
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

可行但**需全專案改指令**：例如 `firebase deploy --config config/firebase/firebase.json`，且 `firebase.json` 內所有相對路徑要改為以該檔所在目錄為基準重新計算。本 repo 以**文件索引 + 根目錄慣例**管理即可，成本低於搬移。

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-05-05 | 初稿：Firebase 相關檔案分類與根目錄保留原因 |
| 1.1 | 2026-05-05 | **§3**：`scripts/dev-oneclick` 一鍵本機；後續節號遞延 |
