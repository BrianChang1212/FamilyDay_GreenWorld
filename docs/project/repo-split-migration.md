# FamilyDay 倉庫拆分（遷移與邊界）

為支援前後端團隊**各自排程與發佈節奏**，成品交付以**兩個執行 repo**（前端、後端）為邊界；**REST 契約正文與 changelog** 於 **mono-repo `docs/api/`** 維護（**不再**維護 **`familyday-api-contract/`** 目錄）。

## 執行環境倉庫（目標）

- `familyday-frontend`：前端執行環境與測試。
- `familyday-backend`：Firebase Functions 後端執行環境。

## 契約文件（mono `docs/`）

- **`docs/api/api-v0.1.md`**、**`docs/api/CHANGELOG.md`**：**規格與發佈變更敘述**。
- **`docs/api/README.md`**：索引、標籤與發佈流程約定。
- 倉庫根 **[`.github/CODEOWNERS`](../../.github/CODEOWNERS)**：對上述 **`docs/api/*`** 之審查清單指派。

## 現行本機目錄配置

- `20260410_FamilyDay_GreenWorld_App/familyday-frontend`
- `20260410_FamilyDay_GreenWorld_App/familyday-backend`

## 歷史內容對照（拆分前）

- 舊 `source/**` → `familyday-frontend`
- 舊 `functions/**` ＋ 根目錄 Firebase 設定 → `familyday-backend`
- 舊 `docs/specs/api-v0.1.md` → **`docs/api/api-v0.1.md`**、**`docs/api/CHANGELOG.md`**
- 曾存在 **`familyday-api-contract/`**（敘述用 governance／巢狀 CI）→ **2026-05-11 起移除**；內容已收斂至 **`docs/api/`** 與根 **`.github/`**

## 目標檔案對照（拆分產出）

### familyday-frontend

- `source/**`（歷史名稱；實際開發樹為 `familyday-frontend/**`）
- 由 `.github/workflows/ci.yml` 轉出／對應的前端專用 workflow（若拆分後仍存在）
- 前端 `README.md`、`.gitignore`、`.env.example`

### familyday-backend

- 拆分前舊名 **`functions/**`**；現行程式與 **`firebase.json`** 根位於 **`familyday-backend/`**（**`src/**`、`scripts/**`** 等），且 **`firebase.json`** 之 **`functions.source` 為 `.`**，並**無**巢狀子目錄 **`familyday-backend/functions/**`** 作為 NPM 套件根
- 後端設定檔：
  - `firebase.json`
  - `.firebaserc`
  - `fdgw.project.json`
  - `firestore.rules`
  - `firestore.indexes.json`
- 後端 `README.md`、`.gitignore`、`.env.example`

### 契約（本 mono-repo，非獨立目錄）

- **`docs/api/api-v0.1.md`**、**`docs/api/CHANGELOG.md`**、**`docs/api/README.md`**

## 拆分產出之排除項目

**勿**遷移下列建置產物／本機快取：

- `**/node_modules/**`
- `source/dist/**`
- `familyday-backend/lib/**`（及歷史上 `functions/lib/**` 若仍存在）
- `*.log`
- `.env*`（範本如 `.env.example` 除外）

## 跨倉庫／ mono 整合規則

- 前端透過 `VITE_API_BASE` 存取後端，**不依賴** mono-repo 相對路徑硬連。
- 後端以 `fdgw.project.json` 作為部署專案識別之**單一來源**。
- API **規格與 changelog** 變更：**只**改 **`docs/api/`**，並視需要打 **`contract-v*`** tag；前後端 release 再行對齊標籤或 commit。

## 切換（cutover）規則

- **新功能開發**以拆分後之 **frontend／backend** 邊界為準。
- **契約**沿用本 mono-repo **`docs/api/`**，與歷史上的「三支線」敘事中 **`familyday-api-contract/`** 目錄**解耦**（該資料夾**已移除**）。
- 根目錄舊資料夾（`source/`、`functions/`）若仍存在，視為**唯讀歷史參考**，**不應**再新增功能開發。

## 倉庫網址

<!-- TODO：補上拆分後前後端遠端 URL（例如 GitHub） -->
