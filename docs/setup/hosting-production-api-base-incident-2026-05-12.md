# 正式 Hosting：前端誤Embed本機 `VITE_API_BASE` — 現象、根因與處置

> **類型：** 部署／設定（非後端當機）  
> **日期：** 2026-05-12  
> **範圍：** Firebase Hosting 靜態前端 + Cloud Functions API；與 [Functions 首次部署報告](./functions-deploy-incident-report-2026-05-11.md)（後端 IAM／Invoker）為不同議題。

---

## 1. 現象（使用者可見）

- 在**正式 Hosting 網址**操作**報到**流程，於確認彈窗送出時，出現紅字：
  - **「無法連線到伺服器，請確認網路與 API 服務狀態。」**
- 闖關登入等會呼叫後端的畫面，亦可能出現相同語意之錯誤（RegisterView 等處對 `Failed to fetch` 的對應文案類似）。

**對應程式位置（錯誤映射，利於 log／除錯）：**

- `familyday-frontend/src/views/checkin/CheckInFormView.vue` — `friendlyCheckinError()` 內對 `err.message.includes("Failed to fetch")` 回傳上句中文。
- `familyday-frontend/src/api/submitCheckin.ts` — `fetch(\`${base}/api/v1/checkin\`, …)`；`base` 來自 `getViteApiBase()`（亦即建置期寫入的 `VITE_API_BASE`）。

---

## 2. 根因

**生產環境的 JS bundle 內嵌了開發用 API 根路徑，導致瀏覽器向「使用者自己裝置上的 localhost／emulator」發請求，必然失敗。**

說明：

1. 開發者通常在 `familyday-frontend/.env.local` 設定 **`VITE_API_BASE`**（例如 Functions emulator：`http://localhost:5003/<project>/us-central1/api`，或 mock `http://localhost:8787`）。該檔屬本機設定，不提交版本庫。
2. 執行根目錄慣例 **`cd familyday-frontend && npm run build`** 時，Vite 會載入多層 `.env*`；在僅有 `.env.local`、未透過「**程序環境變數**」覆寫的情況下，**上述本機 URL 仍會被編進 `dist/`**。
3. 使用者於手機或一般網路開啟 **`https://<專案>.web.app`**（或自訂網域）時，頁面上的 `fetch` 目標仍是 **該使用者裝置可解析的 `localhost:5003`（等）** → 連線被拒或無服務 → 瀏覽器拋 **`TypeError: Failed to fetch`** → 觸發 §1 中文錯誤。

**驗證方式（擇一）：**

- 於 `familyday-frontend` 目錄執行 Node，呼叫 Vite 的 `loadEnv('production', cwd, '')`，檢查合併後的 `VITE_API_BASE` 是否仍為本機 URL。
- 建置後於 **`familyday-frontend/dist/assets/*.js`** 搜尋 `localhost:5003`、`127.0.0.1:8787` 等字串。

---

## 3. 處置（已於倉庫實作）

目標：**任何「要上傳到 Firebase Hosting」的前端建置，一律以正式 HTTPS API 根為 `VITE_API_BASE`，不受本機 `.env.local` 影響。**

| 步驟 | 內容 |
|------|------|
| 1 | 新增 **`familyday-backend/scripts/build-frontend-for-hosting.mjs`**：在子程序中執行 `familyday-frontend` 的 `npm run build`，並在 **`env` 內設定 `VITE_API_BASE`**。依 [Vite 文件](https://vite.dev/guide/env-and-mode.html)，**已存在於執行環境的變數優先於 `.env` 檔**，可覆寫 `.env.local`。 |
| 2 | 解析順序：**`process.env.VITE_API_BASE`**（若已設）→ 否則讀 **`familyday-backend/fdgw.project.json`** 的 **`productionApi.viteApiBase`**（字串、無尾隨 `/`）。 |
| 3 | 調整 **`familyday-backend/package.json`**：**`deploy:hosting`** / **`deploy:app`** 在 `sync-hosting-dist` 與 `firebase deploy` 之前先跑上述腳本；另提供 **`build:frontend:hosting`** 僅建置前端。 |
| 4 | **`fdgw.project.json`**：新增 **`productionApi.viteApiBase`**，值須與 **`firebase deploy`** 完成後輸出之 **Function URL（HTTPS 根）**一致（本專案曾為 `https://api-hxe6k6ncza-uc.a.run.app`，**若日後重新部署函式導致 URL 變更，必須同步更新此欄並重新部署 Hosting**）。 |
| 5 | **Windows**：以 `spawnSync("npm", ["run", "build"], { shell: true, … })` 呼叫建置，避免僅指定 `npm.cmd` 且 `shell: false` 時出現 **`EINVAL`**。 |

---

## 4. 標準操作提醒

```text
cd familyday-backend
npm run deploy:app
```

或僅更新靜態站：

```text
cd familyday-backend
npm run deploy:hosting
```

手動覆寫 API 根（不依賴 `fdgw` 欄位）時，可於建置前設定環境變數（PowerShell 範例）：

```powershell
$env:VITE_API_BASE = "https://<your-function-host>"
cd ..\familyday-frontend
npm run build
```

---

## 5. 易混淆問題（鑑別）

| 情況 | 說明 |
|------|------|
| **CORS** | 若 Hosting 網域未列於 **`fdgw.project.json` → `corsOrigins`**，瀏覽器也可能以 **`Failed to fetch`** 呈現。需與 §2 一併排查（Network 面板是否為 CORS 錯誤）。 |
| **後端真實故障** | Function 無法啟動或 Firestore 拒絕等，多為 **HTTP 4xx/5xx** 或 JSON 錯誤碼，與純 `Failed to fetch` 不同；可對 **Function URL** 做 `GET /api/v1/health`（若專案有暴露）等 smoke 測試。 |

---

## 6. 相關檔案索引

- `familyday-backend/scripts/build-frontend-for-hosting.mjs`
- `familyday-backend/scripts/sync-hosting-dist.mjs`
- `familyday-backend/fdgw.project.json`（`productionApi.viteApiBase`、`corsOrigins`）
- `familyday-backend/package.json`（`deploy:hosting`、`deploy:app`、`build:frontend:hosting`）
- `familyday-frontend/src/lib/apiBase.ts`
- `familyday-frontend/.env.example`（本機範例；勿依賴其預設作為正式建置來源）
- 對外入口 URL（QR）：[`hosting-public-entry-urls.md`](./hosting-public-entry-urls.md)

---

**文件版本：** v1.0 · 2026-05-12
