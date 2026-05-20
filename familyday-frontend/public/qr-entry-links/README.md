# 入口 QR 圖檔（報到／闖關／領獎）

本目錄之 PNG 已納入版控；**Firebase Hosting** 部署後可直接透過下列路徑存取（與掃碼結果一致）：

| 檔案 | Hosting 路徑 | 編碼 URL（預設產生） | 掃碼後行為 |
|------|----------------|----------------------|------------|
| `entry-check-in.png` | **`/qr-entry-links/entry-check-in.png`** | **`https://<專案ID>.web.app/check-in`** | 寫入報到意圖 → **報到歡迎**（再接 `/checkin` 流程） |
| `entry-game.png` | **`/qr-entry-links/entry-game.png`** | **`https://<專案ID>.web.app/game`** | 寫入闖關意圖 → **闖關歡迎**（`/` → 說明 → **`/register`** 工號姓名登入） |
| `entry-reward.png` | **`/qr-entry-links/entry-reward.png`** | **`https://<專案ID>.web.app/reward`** | **領獎入口**：已登入 → 直接 **`/finish`**；未登入 → 寫入 `pendingFinish` 旗標 → **`/register`** → 登入後跳 **`/finish`** |

預設 **`<專案ID>`** 來自 `familyday-frontend/fdgw.project.json` 之 **`firebaseProjectId`**（現為 **`rare-lattice-495009-i9`**）。**`firebaseapp.com`** 與 **`web.app`** 同專案、路徑相同即可。

**重新產生**（於 `familyday-frontend/`）：

```bash
npm run qr:entry-links
# optional: FDGW_HOSTING_BASE=https://rare-lattice-495009-i9.firebaseapp.com npm run qr:entry-links
```

腳本：`familyday-frontend/scripts/generate-entry-link-qr.mjs`。

**現場用途：** 列印或螢幕顯示 PNG；掃描後與瀏覽器直接開啟 **`/check-in`**、**`/game`** 相同，**已於 Firebase 上架環境驗證可進報到與闖關（含登入頁）流程**。完整 URL 對照見 [`docs/setup/hosting-public-entry-urls.md`](../../../docs/setup/hosting-public-entry-urls.md)。
