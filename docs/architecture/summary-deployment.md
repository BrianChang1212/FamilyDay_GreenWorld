# 架設環境與部署 — 討論總結

> 本文件彙整**雲端／內網、反向代理、PaaS 選型與現場網路**之討論結論，供與 IT／主辦對齊。  
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

與下方「全端／API 上線」不同：僅將 **Vite 建置產物**（`source/dist`）放於 **Netlify**、**GitHub Pages** 等靜態主機，供手機試操作。倉庫內含 **`netlify.toml`**、**`.github/workflows/deploy-github-pages.yml`**；步驟見根目錄 **`README.md`**「公開預覽部署」。**未接 API** 時，領取成功頁以前端 **`sessionStorage`** 類比並標示預覽用（見 [`summary-frontend.md`](./summary-frontend.md) §2.1 **`local-fallback`**）。

---

## 2. 曾討論的架構選項（由複雜到簡化）

### 2.1 公司內網 + 對外入口（DMZ + Nginx）

- **內網**：FastAPI + PostgreSQL。  
- **DMZ**：**Nginx** 終止 **HTTPS**，`proxy_pass` 至內網 API；防火牆僅開 **443** 至 DMZ，DB 不對外。  
- **適用**：資料須留在公司、由 IT 開 DNAT／DMZ。  
- **使用者路徑**：手機仍經**網際網路**連到對外 IP，與「純內網不可從園區直連」須區分。

### 2.2 更簡化變體

- **單台台灣區域 VPS／雲 VM**：Docker Compose（Nginx + API + Postgres）一體，營運較單純（須公司允許資料上雲）。  
- **DMZ 單機全包**：Nginx + API + DB 同在 DMZ，少跨網段反代，但**安全分段較弱**，需資安同意。

### 2.3 PaaS + 託管資料庫（討論中偏「營運省事」）

- **形態**：託管 **PostgreSQL** + **Web Service** 跑 FastAPI；前端靜態可另託管（CDN）。  
- **常見組合**：**Render／Railway**（一條龍）；**Neon + Fly.io** 或 **Neon + Cloud Run**（運算與 DB 分開）。  
- **公司限制**：若僅允許 **AWS／Azure**，則改為該生態之 **Container／Serverless + 託管 Postgres**，並用官方 **Pricing Calculator** 估算。

---

## 3. 區域與延遲

- 雲端節點優先選**鄰近台灣**（如**東京、新加坡**等，依平台可用區），降低 RTT。  
- **Firebase vs PostgreSQL** 之討論結論：本專案關聯資料與規則多，**以 PostgreSQL 為主**較合適（細節見 [`summary-backend.md`](./summary-backend.md)）。

---

## 4. 付款與採購注意

- **Render**：Workspace 方案 + Web Service / Postgres 規格分開計價（見 [Render Pricing](https://render.com/pricing)）。  
- **Railway**：月費訂閱 + 依 **CPU／RAM／Volume／Egress** 用量（見 [Railway Docs Pricing](https://docs.railway.app/pricing)）。  
- **Neon**：Free 或按 **CU-hour、儲存、流量**（見 [Neon Pricing](https://neon.tech/pricing)）。  
- **Fly.io**、**GCP Cloud Run**：按 **Machine／vCPU-秒／流量** 等（見官方定價頁）。  

**實際月費**隨規格、是否 24/7、活動尖峰而變，無法在本文給固定數字；需以計算機與壓測後規格代入。

---

## 5. 建議決策流程

1. 確認公司是否**限定雲廠商**、資料是否**必須留在內網**。  
2. 若可上雲且要省事 → **PaaS + 託管 Postgres**；活動日視壓測調整 **實例數／min instances**。  
3. 若必須公司機房 → **DMZ Nginx + 內網 API + 內網 DB**，由 IT 開防火牆與憑證。  
4. 正式前：**HTTPS、備份、日誌、還原演練**；綠世界現場做一次**連線抽測**。

---

## 修訂紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-04-10 | 初稿：DMZ／VPS／PaaS、區域、採購注意、決策流程 |
| 1.1 | 2026-04-18 | **§1.1**：前端原型靜態預覽（Netlify／GitHub Pages、與全端部署區隔） |
