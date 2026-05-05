# 靜態預覽部署（測試 Web UI）

給他人用手機／瀏覽器試操作，可不接後端；與 [`summary-deployment.md`](../architecture/summary-deployment.md) **§1.1**（修訂 **v1.6**）、[`summary-frontend.md`](../architecture/summary-frontend.md) **§4** 互相連結。

靜態檔來自 `familyday-frontend/` 的 `npm run build` 產物（`familyday-frontend/dist`）。**建議優先使用 Netlify**（子路徑與 Vue Router 較省事）；亦可使用本倉庫內建的 GitHub Actions 發布至 GitHub Pages。

> **用途標記 · 測試 Web UI 操作**  
> 下表 **Netlify 網址**與 **QR 用連結**僅供 **測試介面與流程**（內部／利害關係人預覽）。**非**正式活動對外定案之網域或 SLA；正式上線請改用公司核可的網域、後端與資安設定。若於 Netlify **變更站名或自訂網域**，請同步更新本文件與實體 QR 內嵌網址。

## 測試 Web UI：Netlify 預覽站（與 GitHub 連動）

| 項目 | 說明 |
|------|------|
| **預覽網址（範例）** | **[https://familyday-greenworld.netlify.app](https://familyday-greenworld.netlify.app)** — 以 Netlify **Domain management** 顯示為準 |
| **自動更新** | 站台已 **Connect to Git** 時，對 **`main`**（或綁定分支）**push** 且建置成功後，線上 UI 即為新版；失敗時仍為上一版 **Published** |
| **首次匯入注意** | 設定畫面須填 **Base directory：`familyday-frontend`**（與 [`netlify.toml`](../../netlify.toml) 一致）；**Publish directory：`dist`**；**勿**設 `VITE_BASE_PATH`（站點在網域根目錄） |
| **存續** | 站點未刪除、帳號與方案有效時，網址通常**持續可用**；免費方案有建置分鐘／流量等額度，見 [Netlify 方案說明](https://www.netlify.com/pricing/) |

### 報到／闖關分流（同一預覽站、不同路徑 — 印靜態 QR 時請含完整 `https`）

| 用途 | 測試用連結（範例網域同上；若更換請只替換主機名） |
|------|------|
| 報到 | `https://familyday-greenworld.netlify.app/check-in` |
| 闖關 | `https://familyday-greenworld.netlify.app/game` |

**QR 產生器（靜態碼，內容＝上列網址即可）：** 例如 [MakeQRCode](https://makeqrcode.app/)、[The Free QR Code Generator](https://the-free-qrcode-generator.com/)、需 Logo／印刷輸出時 [QRCode Monkey](https://www.qrcode-monkey.com/)。列印建議錯誤修正 **Q 或 H**，印出前務必實掃確認。

### 方式 A：Netlify（建議）

1. 登入 [Netlify](https://www.netlify.com/)，**Add new site → Import an existing project**，授權並選取本 GitHub 儲存庫。  
2. 建置設定由 [`netlify.toml`](../../netlify.toml) 帶入；若 UI 未帶出，手動確認 **Base directory = `familyday-frontend`**、`npm run build`、**Publish directory = `dist`**，並已設定 SPA 導向（子路徑重新整理可開）。  
3. 部署完成後將 **`https://…netlify.app`** 傳給預覽者。**勿設定 `VITE_BASE_PATH`**（`vite.config` 預設 `base: '/'`）。

### 方式 B：GitHub Pages

1. 將變更推上 GitHub 預設分支（如 `main`）。  
2. 儲存庫 **Settings → Pages**：**Build and deployment** 的 **Source** 選 **GitHub Actions**（首次需儲存設定）。  
3. 工作流程：[`.github/workflows/deploy-github-pages.yml`](../../.github/workflows/deploy-github-pages.yml) 會在 `familyday-frontend/` 內建置，並設定 `VITE_BASE_PATH=/<repo名稱>/`，產物並複製 `index.html` 為 `404.html` 以利 SPA。  
4. 至 **Actions** 手動執行 **Deploy GitHub Pages**（`workflow_dispatch`）；**勿**在未完成 Pages 設定前強求每次 push 自動部署（避免檢查顯示失敗）。例行 push 僅執行建置驗證：[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)。  
5. 網址形如：`https://<你的帳號>.github.io/<repo名稱>/`（以實際帳號／倉庫名為準）。

## 同區網快速試機（不經 Netlify／GitHub）

在 `familyday-frontend/` 執行 `npm run dev -- --host`，以手機與電腦連同一 Wi‑Fi，手機瀏覽器開 `http://<電腦區網IP>:5173`（防火牆需允許該連接埠）。
