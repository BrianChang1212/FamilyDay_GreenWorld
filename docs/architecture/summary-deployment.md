# 架設環境與部署 — 討論總結

> 本文件彙整**Firebase 部署、費用告警與現場網路**之討論結論，供與 IT／主辦對齊。  
> 實際報價與合約以各廠商官網及採購規定為準。

---

## 1. 使用者與活動情境

| 項目 | 結論 |
|------|------|
| 使用者地理 | 以**台灣**為主 |
| 活動地點 | **新竹北埔・綠世界**（現場以手機 4G／園方 WiFi 連網） |
| 連線特性 | **在線人數 ≠ 固定 RPS**；無自動刷新時，**不操作則幾乎無請求**（詳見 [`summary-traffic.md`](./summary-traffic.md)） |

**現場網路**：瓶頸多在**最後一哩**（訊號、WiFi 容量），其次才是機房與 API；建議場勘實測，靜態資源走 **CDN**。

### 1.1 前端原型靜態預覽（無後端）

與下方「全端／API 上線」不同：僅將 **Vite 建置產物**（`source/dist`）放於 **Netlify**、**GitHub Pages** 等靜態主機，供手機試操作。倉庫內含 **`netlify.toml`**、**`.github/workflows/deploy-github-pages.yml`**；**例行 CI** 另見 **`.github/workflows/ci.yml`**（`npm run test` → `npm run build`）。步驟與 **測試 Web UI** 細節見根 [`README.md`](../../README.md#preview-netlify-test-ui)（**公開預覽部署 · 測試 Web UI**，錨點 **`preview-netlify-test-ui`**）。**未接 API** 時，領取成功頁以前端 **`sessionStorage`** 類比並標示預覽用（見 [`summary-frontend.md`](./summary-frontend.md) §2.1 **`local-fallback`**）。

**測試 Web UI 操作（標記）：** 根 [`README.md`](../../README.md#preview-netlify-test-ui) 同節已註記 **僅供測試介面／流程** 之 **Netlify 預覽網址（範例）**、與 Git **`main` 連動自動部署**、**Base directory = `source`**、以及 **報到／闖關** 用 **QR 網址**（`/check-in`、`/game`）與 **靜態 QR 產生器**參考連結。正式活動網域與 QR **不應**逕用該測試網址，應另定案。

---

## 2. 後端部署方案（定案）

### 2.1 Firebase（正式主線）

- 後端資料主線採 **Cloud Firestore**；即時高併發需求可加用 **Realtime Database**。  
- 費用採 **Blaze 隨用隨付**，並配置 **Budgets & Alerts**（建議 50%/90%/100%）。  
- 安全以 **Firebase Security Rules** 與身分驗證策略控管。

### 2.2 前端預覽與正式環境

- 前端原型仍可用 Netlify / GitHub Pages 做靜態預覽。  
- 正式資料與身分驗證走 Firebase 專案（建議分 `dev/stage/prod`）。

---

## 3. 區域與延遲

- 雲端節點優先選**鄰近台灣**（如**東京、新加坡**等，依平台可用區），降低 RTT。  
- **目前定案**：本專案後端以 **Firebase** 為主（細節見 [`summary-backend.md`](./summary-backend.md)）。

---

## 4. 付款與採購注意

- Firestore 計價核心為讀取/寫入/刪除、儲存與對外流量。  
- Realtime Database 計價核心為儲存與下載流量（連線上限 Blaze 為 200K / DB）。  
- 以目前估算量級，單日活動費用可維持低成本；仍建議以壓測與實際流量驗證。

**實際月費**隨規格、是否 24/7、活動尖峰而變，無法在本文給固定數字；需以計算機與壓測後規格代入。

---

## 5. 建議決策流程

1. 建立 Firebase `dev/stage/prod` 專案與最小權限原則。  
2. 設定 Blaze 預算與告警門檻，確認通知對象。  
3. 先以靜態預覽驗證前端流程，再接 Firebase 真實資料流。  
4. 活動前完成壓測、Rules 審查與現場網路抽測。

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-04-10 | 初稿：DMZ／VPS／PaaS、區域、採購注意、決策流程 |
| 1.1 | 2026-04-18 | **§1.1**：前端原型靜態預覽（Netlify／GitHub Pages、與全端部署區隔） |
| 1.2 | 2026-04-18 | **§1.1**：補 **測試 Web UI** 標記、Netlify 範例與 QR 分流見根 **`README.md`**（錨點 **`preview-netlify-test-ui`**） |
| 1.3 | 2026-04-18 | **§1.1**：「測試 Web UI 操作」段 **`README`** 改為可點連結 [`README#preview-netlify-test-ui`](../../README.md#preview-netlify-test-ui) |
| 1.4 | 2026-04-19 | **§1.1**：補 **`.github/workflows/ci.yml`**（`npm run test` → build）與靜態預覽 workflow 之分流說明 |
| 1.5 | 2026-04-27 | 後端部署主線改為 **Firebase**，移除舊 PaaS/DMZ 主方案敘事 |
