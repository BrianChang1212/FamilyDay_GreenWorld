# 正式環境入口 URL（報到／闖關 各一）

> **建議對外（品牌化）Hosting 網域：**  
> **`https://amtran.familyday.green.world`**  
> 需在 **[Firebase Console → Hosting → 自訂網域](https://console.firebase.google.com/)** 完成網域驗證，並在 DNS 供應商依畫面設定 **TXT／CNAME**；此步驟無法由程式庫代為完成。

> **備援／內測（Firebase 預設）：**  
> **`https://rare-lattice-495009-i9.web.app`**、`https://rare-lattice-495009-i9.firebaseapp.com`

### 實際上架後常用連結（`firebaseapp.com`，2026-05-13）

與線上驗收一致之**捷徑**（瀏覽器／手動分享）；標題與頁面內容可對照 [Firebase Hosting 公開頁](https://rare-lattice-495009-i9.firebaseapp.com/)（根路徑與 `/checkin`）。

| 用途 | 完整 URL |
|------|----------|
| **報到**（報到歡迎） | **`https://rare-lattice-495009-i9.firebaseapp.com/checkin`** |
| **闖關**（首頁歡迎） | **`https://rare-lattice-495009-i9.firebaseapp.com/`** |

**對照：** **`https://rare-lattice-495009-i9.web.app`** 與上列**路徑相同**即可（Firebase 雙網域）。下方「建議印的兩條連結」若將 **`{ORIGIN}`** 換為 **`https://rare-lattice-495009-i9.firebaseapp.com`**，則 **`{ORIGIN}/check-in`**、**`{ORIGIN}/game`** 會在進入時寫入 **`sessionStorage` 進場意圖**（見 `familyday-frontend/src/router/index.ts`）；直接開 **`/checkin`** 或 **`/`** 亦為有效畫面入口。

SPA 為 **Vue Router History** 模式：**同一個網域**下用**不同路徑**區分進場意圖；後端 API 網址不變（與 **`VITE_API_BASE`** 相同）。

---

## Repo 內建 QR 圖檔（`/check-in`／`/game`）

已產製之 PNG 置於 **`familyday-frontend/public/qr-entry-links/`**（部署後路徑 **`/qr-entry-links/entry-check-in.png`**、**`/qr-entry-links/entry-game.png`**）。內容分別編碼 **`{ORIGIN}/check-in`** 與 **`{ORIGIN}/game`**（預設 **`ORIGIN`**＝**`https://<firebaseProjectId>.web.app`**，見 `scripts/generate-entry-link-qr.mjs`）。**掃碼可進報到流程與闖關流程（含闖關身分登入頁 `/register`）**；與手動開啟上列 URL 等效。重產指令：`familyday-frontend` 內 **`npm run qr:entry-links`**。目錄說明見該資料夾 [`README.md`](../../familyday-frontend/public/qr-entry-links/README.md)。

---

## 建議印的兩條連結（QR／DM）

將下表 **`{ORIGIN}`** 替換為實際對外網域（建議 **`https://amtran.familyday.green.world`**）。

| 用途 | 路徑 | 完整 URL 範例 |
|------|------|----------------|
| **現場報到** | **`/check-in`** | **`{ORIGIN}/check-in`** |
| **闖關／遊戲** | **`/game`** | **`{ORIGIN}/game`** |

對外範例：

| 用途 | 完整 URL |
|------|-----------|
| **現場報到** | **`https://amtran.familyday.green.world/check-in`** |
| **闖關／遊戲** | **`https://amtran.familyday.green.world/game`** |

說明：

- **`/check-in`**：會寫入 **報到** 進場意圖（`sessionStorage`），並導向報到歡迎流程。
- **`/game`**：會寫入 **闖關** 進場意圖，並導向首頁歡迎再接闖關說明／登錄。
- **`/register`** 為闖關用的**姓名／工號**頁（非報到）；報到填表請用 **`/checkin/register`**（通常自報到歡迎接續）。

**CORS：** `https://amtran.familyday.green.world`（無路徑）已納入 **`familyday-backend/fdgw.project.json` → `corsOrigins`**；變更後需 **重新部署 `functions:api`** 才會在線上生效（見倉庫 deploy 腳本）。

---

**對照：** 路由定義見 `familyday-frontend/src/router/index.ts`（`checkinEntry`、`gameEntry`）。

**文件版本：** v1.3 · 2026-05-13（補 **`public/qr-entry-links`** 兩張入口 QR 與 Hosting 路徑、`npm run qr:entry-links`）
