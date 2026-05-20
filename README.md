# 瑞軒 2026 家庭日 — 解謎闖關遊戲（綠世界生態農場）

<p align="center">
  <img src="familyday-frontend/public/images/enroll-welcome-alpaca-adventure-wide-headroom.png" alt="瑞軒 2026 家庭日 — 綠世界闖關活動主視覺（羊駝與熱帶雨林插畫；與 Welcome 頁相同資產）" width="720" />
</p>

## 這是什麼

現場**報到**與**闖關**合一的 Web App（Vue 3 + Vite + Firebase）。細節、截圖、技術圖、目錄表與長篇待辦條列見 **[`docs/overview/root-readme-supplement.md`](docs/overview/root-readme-supplement.md)**。

---

## 快速開始

<a id="quick-start"></a>

需求：**Node.js 20+**。

```bash
cd familyday-frontend
npm install
npm run dev
```

埠號以 [`fdgw.project.json`](fdgw.project.json) 為準（預設常為 `5173`）。

**Windows 一鍵（前端 + API + 雲端 Firestore）**、環境變數與故障排除：[`docs/setup/README.md`](docs/setup/README.md)、[`docs/setup/local-firestore-gcp.md`](docs/setup/local-firestore-gcp.md)。

**Firebase Hosting（實際上架 · `firebaseapp.com`）**

| 用途 | URL |
|------|-----|
| **報到**（報到歡迎／流程入口） | [https://rare-lattice-495009-i9.firebaseapp.com/checkin](https://rare-lattice-495009-i9.firebaseapp.com/checkin) |
| **闖關**（首頁歡迎 → 說明／登入） | [https://rare-lattice-495009-i9.firebaseapp.com/](https://rare-lattice-495009-i9.firebaseapp.com/) |

同專案另有 **`https://rare-lattice-495009-i9.web.app`**（與上列路徑相同）。**現場入口 QR：** 已內建於 [`familyday-frontend/public/qr-entry-links/`](familyday-frontend/public/qr-entry-links/)（**`entry-check-in.png`** → **`/check-in`** 報到；**`entry-game.png`** → **`/game`** 闖關與**登入**）；部署後亦可自 **`/qr-entry-links/…`** 下載列印。詳見該目錄 **`README.md`** 與 [`docs/setup/hosting-public-entry-urls.md`](docs/setup/hosting-public-entry-urls.md)。

核心入口：

| 用途 | 連結 |
|------|------|
| **全系統架構圖（前端 + API + 後端）** | [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md) |
| 需求／待辦／狀態（主文件） | [`docs/project/project-master.md`](docs/project/project-master.md) |
| 本機與預覽 | [`docs/setup/README.md`](docs/setup/README.md) |
| API v0.1 | [`docs/api/api-v0.1.md`](docs/api/api-v0.1.md) · [`docs/api/CHANGELOG.md`](docs/api/CHANGELOG.md) · 索引 [`docs/api/README.md`](docs/api/README.md) |
| `docs/` 索引 | [`docs/README.md`](docs/README.md) |

---

<a id="readme-live-progress"></a>

## 即時進度（工作來源之一）

> **工作約定：** **本表**為**進度現況**之**權威**來源（View／API 函式數／測試檔數等）。**待辦勾選與完整行動清單**以 [`docs/project/project-master.md` § 待辦事項](docs/project/project-master.md#work-backlog) 為準。

> **計數／端點：** 2026-05-11 依原始碼掃描（仍有效；後端 **19** 端點、前端 **10** View／**11** API 函式／**16** 測試檔）。**2026-05-13** 起 **文件完整對齊**：**SPA** **`Authorization: Bearer`** + **`sessionStorage`**；契約 **`api-v0.1` v0.1.25–v0.1.26**（含 **`POST …/auth/login`** 回 **`ok`**／**`token`**／**`user`**，見 **`familyday-backend/src/routes/auth.ts`**）；**`system-architecture` v1.5**（§6.3 新增外部 QR scanner 序列）；**`api-integration-checklist`** Bearer 前置與 §7 說明；**`project-master` v1.3.56**。**同日：** **Firebase Hosting 上架後**已做**全端手動驗收**——**報到（check-in）**與**闖關**主流程之功能與操作**符合需求**（紀錄見 [`docs/testing/api-integration-checklist.md`](docs/testing/api-integration-checklist.md) §7、`docs/testing/api-integration-history.md`）。背景見 [`docs/setup/ios-mobile-auth-fix-2026-05-13.md`](docs/setup/ios-mobile-auth-fix-2026-05-13.md)。**admin/reports**：**`total`／`checkedIn`**、**`progress`** 占位見 [`familyday-backend/src/routes/admin.ts`](familyday-backend/src/routes/admin.ts)。**2026-05-19：** Firestore IAM 憑證設定完成（SA JSON）；**`npm run verify:firestore`** 對正式 Cloud Functions 端點執行，四集合讀寫 **PASS**；前後端重新部署（Functions `api-hxe6k6ncza-uc.a.run.app`、Hosting `rare-lattice-495009-i9.web.app`）；**報到（check-in）＋闖關（game）功能於正式環境驗證完成**；**`project-master` v1.3.55**。**2026-05-20：** 外部 QR scanner 相容（站台 PNG 改編為 `https://<host>/scan?t=<JWT>` 深連結 + SPA `/scan` dispatcher）；闖關紀錄保留（`RegisterView` 登入不再 `restartPlaythrough`、`applyAttemptResult` 移除 stage-1 auto-reset，全破玩家再登入與重玩皆保留 6/6 ✓）；前後端重新部署；commit `4bdfb5d`；**`project-master` v1.3.56`**。**同日（合併部署）：** ResultView 三向分流（首次全破 → 領獎、重玩答對 → 關卡列表）；StageView 6/6 常駐「前往領取闖關禮」CTA；決策抽離至 `src/lib/resultAction.ts`（6 unit tests）；commit `08d60ee`；**`project-master` v1.3.57`**。**同日：** 新增 `/reward` 入口路由 + `entry-reward.png`（領獎台 QR），對應 `pendingFinish` 旗標讓未登入掃描者登入後直接落地 `/finish`；qr-entry-links 共 3 張入口 QR（報到 / 闖關 / 領獎）；**`project-master` v1.3.58`**。

| 面向 | 現況 |
|------|------|
| 前端 | 10 個 View **全數完整實作**（WelcomeView → FinishView；舊 **`/finish/claimed`** 僅 redirect **`/finish`**）；API 層 11 支函式對應真實端點；16 個測試檔無 skip/stub；CI 通過；**闖關 API 呼叫附 Bearer**（`familyday-frontend/src/lib/sessionToken.ts`）；**外部 QR scanner 進入點 `/scan`**（`src/lib/scanEntry.ts` + `qrPayload.ts`） |
| API | **19** 個端點均已實作。**`GET /admin/reports/attendance`**：**`total`**＝Firestore **`roster`**（現行 **`eventId`** 下名冊筆數）；**`checkedIn`**＝**`checkins`** 計數。**`GET /admin/reports/progress`**：**`redeemed`** 取自核銷摘要；**`players`／`fullClear`** 仍為 **`admin.ts`** 占位常數（待對齊 `player_progress` 聚合） |
| 後端資料層 | roster / checkins / player_progress / redeem 四集合已完整實作 Firestore + in-memory 雙模式切換；**Firestore IAM 憑證已設定**（2026-05-19） |
| 測試 | 前端 Vitest **17** 檔／**121** 測試通過（含 `qrPayload`／`scanEntry`／`/scan`／`/reward` redirect／`resultAction`）；後端 Vitest **5** 檔／**28** 測試通過（加入「全破後重玩不清紀錄」回歸守門）；`verify:firestore` 正式端點 **PASS**（2026-05-19）；**報到（check-in）＋闖關（game）＋ResultView 三向分流＋領獎入口功能於正式環境手動驗證 Pass**（2026-05-19、2026-05-20） |
| 部署 | **Firebase Hosting `rare-lattice-495009-i9.web.app` 已上架**；Cloud Functions `api-hxe6k6ncza-uc.a.run.app`；Firestore 端到端閉環完成；正式上線仍須完成 Security Rules／安全基線與主辦簽核 |

---

## 待辦與進度（摘要）

- **待確認／里程碑表／技術選型細節／下一步完整條列** → [`docs/overview/root-readme-supplement.md#backlog-detail`](docs/overview/root-readme-supplement.md#backlog-detail)
- **主文件（權威待辦）** → [`docs/project/project-master.md` § 待辦事項](docs/project/project-master.md#work-backlog)

**本週摘要（與主文件對齊；勾選以 `project-master` 為準）**

- **高優先：** ~~Firestore IAM、`verify:firestore`~~（**已完成 2026-05-19**）、~~六張正式 QR（JWT）`public/qr-staging-stations/`~~（**已完成 2026-05-19**）、安全基線確認單（**Bearer／XSS**、CORS、Security Rules）
- **中優先：** runbook、Security Rules、後端 checkin／redeem／admin 自動化擴充、~~補強 `GET …/admin/reports/progress`（`players`／`fullClear`）聚合~~（**已完成**：`state/game.ts` `getProgressSummary()` 已對接）
- **低優先：** 見主文件

---

## 對外連結錨點（相容舊連結）

外部文件若仍使用**舊**根目錄 `README.md#…` 錨點，請改連下列**新位置**（內容已集中在補充篇）。

| 錨點 | 說明與新位置 |
|------|----------------|
| [`#preview-netlify-test-ui`](docs/overview/root-readme-supplement.md#preview-netlify-test-ui) | 測試 Web UI／Netlify |
| [`#ui-preview-screenshots`](docs/overview/root-readme-supplement.md#ui-preview-screenshots) | 介面截圖 |
| [`#gcp-service-account-local-firestore`](docs/overview/root-readme-supplement.md#gcp-service-account-local-firestore) | GCP 服務帳戶與本機 Firestore |

---

*README v2.83 · 2026-05-20（新增 `/reward` 入口路由 + `entry-reward.png` 領獎台 QR；前版 v2.82）*
