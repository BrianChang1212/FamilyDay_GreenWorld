# 正式環境入口 URL（報到／闖關 各一）

> **建議對外（品牌化）Hosting 網域：**  
> **`https://amtran.familyday.green.world`**  
> 需在 **[Firebase Console → Hosting → 自訂網域](https://console.firebase.google.com/)** 完成網域驗證，並在 DNS 供應商依畫面設定 **TXT／CNAME**；此步驟無法由程式庫代為完成。

> **備援／內測（Firebase 預設）：**  
> **`https://rare-lattice-495009-i9.web.app`**、`https://rare-lattice-495009-i9.firebaseapp.com`

SPA 為 **Vue Router History** 模式：**同一個網域**下用**不同路徑**區分進場意圖；後端 API 網址不變（與 **`VITE_API_BASE`** 相同）。

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

**文件版本：** v1.1 · 2026-05-11（自訂網域＋CORS 註記）
