# FamilyDay 倉庫拆分（遷移與邊界）

為支援前後端團隊**各自排程與發佈節奏**，本 mono-repo 已拆分為三支獨立倉庫（敘述上的目標邊界與對照如下）。

## 新倉庫

- `familyday-frontend`：前端執行環境與測試。
- `familyday-backend`：Firebase Functions 後端執行環境。
- `familyday-api-contract`：API 契約之**單一來源**與治理（版本／變更流程）。

## 現行本機目錄配置

- `20260410_FamilyDay_GreenWorld_App/familyday-frontend`
- `20260410_FamilyDay_GreenWorld_App/familyday-backend`
- `20260410_FamilyDay_GreenWorld_App/familyday-api-contract`

## 歷史內容對照（拆分前）

- 舊 `source/**` → `familyday-frontend`
- 舊 `functions/**` ＋ 根目錄 Firebase 設定 → `familyday-backend`
- 舊 `docs/specs/api-v0.1.md` → `familyday-api-contract/api-v0.1.md`（mono-repo 內副本已移除；**僅保留契約檔為維護來源**）

## 目標檔案對照（拆分產出）

### familyday-frontend

- `source/**`（歷史名稱；實際開發樹為 `familyday-frontend/**`）
- 由 `.github/workflows/ci.yml` 轉出／對應的前端專用 workflow
- 前端 `README.md`、`.gitignore`、`.env.example`

### familyday-backend

- `functions/**`（實際樹位於 `familyday-backend/functions/**`）
- 後端設定檔：
  - `firebase.json`
  - `.firebaserc`
  - `fdgw.project.json`
  - `firestore.rules`
  - `firestore.indexes.json`
- 後端 `README.md`、`.gitignore`、`.env.example`

### familyday-api-contract

- `api-v0.1.md`（REST 契約基準）
- 契約治理相關檔：
  - `README.md`
  - `CHANGELOG.md`
  - `CODEOWNERS`
  - 契約用 CI workflow

## 拆分產出之排除項目

**勿**遷移下列建置產物／本機快取：

- `**/node_modules/**`
- `source/dist/**`
- `functions/lib/**`
- `*.log`
- `.env*`（範本如 `.env.example` 除外）

## 跨倉庫整合規則

- 前端透過 `VITE_API_BASE` 存取後端，**不依賴** mono-repo 相對路徑硬連。
- 後端以 `fdgw.project.json` 作為部署專案識別之**單一來源**。
- API 契約變更於 `familyday-api-contract` **版型／版本化**後，再由前後端倉庫取用以發佈。

## 切換（cutover）規則

- **新功能開發**應以拆分後之三倉庫為準。
- 本 mono-repo **可保留**以利歷程追蹤（若組織政策如此）。
- 契約變更須**先**自 `familyday-api-contract` 釋出，再由前後端 release 分支接軌。
- 根目錄舊資料夾（`source/`、`functions/`）若仍存在，視為**唯讀歷史參考**，**不應**再新增功能開發。

## 倉庫網址

<!-- TODO：補上三支拆分倉庫之遠端 URL（例如 GitHub） -->
