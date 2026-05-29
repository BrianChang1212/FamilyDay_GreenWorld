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

**Firebase Hosting — 並行兩專案（2026-05-21 起）**

| 環境 | Project ID | Hosting URL | Functions URL |
|------|-----------|-------------|---------------|
| **正式** | `familyday-greenworld` | **[https://familyday-greenworld.web.app](https://familyday-greenworld.web.app)** | `api-jwvq2npioq-uc.a.run.app` |
| 測試 | `rare-lattice-495009-i9` | [https://rare-lattice-495009-i9.web.app](https://rare-lattice-495009-i9.web.app) | `api-hxe6k6ncza-uc.a.run.app` |

**正式環境入口：**

| 用途 | URL |
|------|-----|
| **報到** | [https://familyday-greenworld.web.app/check-in](https://familyday-greenworld.web.app/check-in) |
| **闖關**（首頁／活動入口） | [https://familyday-greenworld.web.app/](https://familyday-greenworld.web.app/) |
| **領獎入口** | [https://familyday-greenworld.web.app/reward](https://familyday-greenworld.web.app/reward) |

部署指令對應：`firebase deploy ... --project=production`（正式）／ 不帶 `--project`（測試 default）。**現場入口 QR：** 已內建於 [`familyday-frontend/public/qr-entry-links/`](familyday-frontend/public/qr-entry-links/)（`entry-check-in.png` / `entry-game.png` / `entry-reward.png`，已重產對應正式 host）；部署後亦可自 `/qr-entry-links/…` 下載列印。詳見該目錄 `README.md` 與 [`docs/setup/hosting-public-entry-urls.md`](docs/setup/hosting-public-entry-urls.md)。

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

> **計數／端點：** 2026-05-11 依原始碼掃描（仍有效；後端 **19** 端點、前端 **10** View／**11** API 函式／**16** 測試檔）。**2026-05-13** 起 **文件完整對齊**：**SPA** **`Authorization: Bearer`** + **`sessionStorage`**；契約 **`api-v0.1` v0.1.25–v0.1.26**（含 **`POST …/auth/login`** 回 **`ok`**／**`token`**／**`user`**，見 **`familyday-backend/src/routes/auth.ts`**）；**`system-architecture` v1.5**（§6.3 新增外部 QR scanner 序列）；**`api-integration-checklist`** Bearer 前置與 §7 說明；**`project-master` v1.3.56**。**同日：** **Firebase Hosting 上架後**已做**全端手動驗收**——**報到（check-in）**與**闖關**主流程之功能與操作**符合需求**（紀錄見 [`docs/testing/api-integration-checklist.md`](docs/testing/api-integration-checklist.md) §7、`docs/testing/api-integration-history.md`）。背景見 [`docs/setup/ios-mobile-auth-fix-2026-05-13.md`](docs/setup/ios-mobile-auth-fix-2026-05-13.md)。**admin/reports**：**`total`／`checkedIn`**、**`progress`** 占位見 [`familyday-backend/src/routes/admin.ts`](familyday-backend/src/routes/admin.ts)。**2026-05-19：** Firestore IAM 憑證設定完成（SA JSON）；**`npm run verify:firestore`** 對正式 Cloud Functions 端點執行，四集合讀寫 **PASS**；前後端重新部署（Functions `api-hxe6k6ncza-uc.a.run.app`、Hosting `rare-lattice-495009-i9.web.app`）；**報到（check-in）＋闖關（game）功能於正式環境驗證完成**；**`project-master` v1.3.55**。**2026-05-20：** 外部 QR scanner 相容（站台 PNG 改編為 `https://<host>/scan?t=<JWT>` 深連結 + SPA `/scan` dispatcher）；闖關紀錄保留（`RegisterView` 登入不再 `restartPlaythrough`、`applyAttemptResult` 移除 stage-1 auto-reset，全破玩家再登入與重玩皆保留 6/6 ✓）；前後端重新部署；commit `4bdfb5d`；**`project-master` v1.3.56`**。**同日（合併部署）：** ResultView 三向分流（首次全破 → 領獎、重玩答對 → 關卡列表）；StageView 6/6 常駐「前往領取闖關禮」CTA；決策抽離至 `src/lib/resultAction.ts`（6 unit tests）；commit `08d60ee`；**`project-master` v1.3.57`**。**同日：** 新增 `/reward` 入口路由 + `entry-reward.png`（領獎台 QR），對應 `pendingFinish` 旗標讓未登入掃描者登入後直接落地 `/finish`；qr-entry-links 共 3 張入口 QR（報到 / 闖關 / 領獎）；**`project-master` v1.3.58`**。**同日：** FinishView 領獎防誤領 — 點「領取闖關禮」改全屏掃 QR，掃到 `fdgw-claim-token` 才呼叫 `/me/reward/claim`；工作人員手持 QR `public/qr-staff-stations/claim-token.png`；解析 `src/lib/claimPayload.ts`（6 unit tests）；**`project-master` v1.3.59`**。**同日：** Hero 視圖 fullBleed —`App.vue` 對 `route.meta.fullBleed` 跳過 90vw 白卡與 safe-area padding，WelcomeView/CheckInWelcomeView 背景圖鋪滿 viewport；WelcomeView 中間換過 `01_welcomeBG.jpg` 9:16 高解析後**復原**至原 `game-welcome-enroll-04.jpg`（commit `6ce9b52`）；BriefingView 地圖換 `02_mapIllu.png`；**`project-master` v1.3.60`**。**同日：** 設計師原版 icon 套用 — StageView 闖關進度 icon 換為山+旗 silhouette、FinishView 領獎狀態 icon 換為獎章+星+雙緞帶 silhouette、領獎三格 slot 改用 `Icon_gift_s_active.png` / `Icon_gift_s_disabled.png`（commit `e597632`）；**`project-master` v1.3.61`**。**2026-05-21：** 正式 Firebase 專案 `familyday-greenworld` 並行上架（Hosting `familyday-greenworld.web.app`、Functions `api-jwvq2npioq-uc.a.run.app`、Firestore 已匯入 111 筆 zh roster）；`.firebaserc` 新增 `staging`/`production` aliases；backend `src/utils/store.ts::getDb()` 修正預設 Firestore database 取得（避免 5 NOT_FOUND）；entry-link QR PNG 已重產對應正式 host；登入功能於正式環境驗證 Pass；commit `acf112b`；**`project-master` v1.3.62`**。**同日：** `PlayerProgress` 加 `rewardRedeemAt: string[]`，每次領獎成功時 push 當下 ISO 時間並寫回 Firestore，提供活動日資料紀錄表（領獎時間一/二/三）直接資料源；無 REST 契約變更；commit `b8e0822`；**`project-master` v1.3.63`**。**2026-05-22：** FinishView 全領完狀態（`isClaimFull` && 3/3）移除「返回首頁」按鈕——同步清掉 `goHome()` handler、`useRouter`／`logoutGame` imports、`actionLoading`／`actionError` refs 與 `finish.backHomeButton` i18n key；commit `c4740e5`；正式環境 `familyday-greenworld.web.app` 部署完成並驗證；**`project-master` v1.3.65`**。**2026-05-25：** 全畫面 fullBleed——`App.vue` 移除外層 90vw 圓角白卡與 safe-area padding 包裝，所有 view 之 root `bg-[#xxx]` 直接鋪到 viewport 邊；`route.meta.fullBleed` 機制與兩處冗餘旗標、`PageCritters` viewport 引用一併移除；bundle 縮 `index.js 310→306 kB`／`index.css 47→45.5 kB`；commit `64abdc2`；正式環境部署完成並驗證；**`project-master` v1.3.66`**。**同日：** 外部 QR 未登入彈窗——`/scan` redirect 不再分流，有無 session 都導 `/quiz?challengeId=<N>`；`QuizView` mount 偵測 `!getSessionToken() && getPendingStationVerification()` → 在前景 mount `StageScanLoginModal`（白卡 + 勾選 icon + 標題「登入帳號開始答題」+ 員編/姓名 input + 確定登入 CTA），無取消鍵、無 backdrop dismiss、唯一退路是登入成功；登入過程不動 `completedStageIds`；i18n 新增 `scanLogin.title`／`scanLogin.submitButton`；router test 同步；commit `fa982ba`；正式環境部署完成並驗證；**`project-master` v1.3.67`**。**同日：** 正式環境 roster 全面替換——舊 111 筆 staging seed test data 已 purge、新 508 筆真實活動資料 import 完成；活動日相關集合（checkins / player_progress / redeem_*）保持 0；過程修了 5 個 admin script 對 production unnamed default Firestore db 的 `5 NOT_FOUND` bug（commit `05c667f`，對齊 `store.ts::getDb()` 解析邏輯）；新增 `docs/setup/local-firestore-gcp.md` §E「對正式環境執行 admin CLI」runbook，明確記載 `FDGW_FIREBASE_PROJECT_ID=familyday-greenworld` 覆寫的必要性；**`project-master` v1.3.68`**。**2026-05-26（dev 全部變更首次完整部署至正式並收尾）：** ① 站 1 名稱 dashboard config 由「水鳥區」對齊「天鵝湖」（與 stage-1 題目／前端一致），重部署 `functions:api`；commit `7a0fc66`。② 相機掃碼登入連續性修正——session token 改存 **`localStorage`**（同瀏覽器跨分頁共享，免重登）＋新增 **`GET /api/v1/auth/me`** client（`src/api/authMe.ts`）＋`QuizView`／`FinishView` 以 `/auth/me` 回填 profile，解決「相機開新分頁被迫重輸員編登入」與「finish 頁顯示預設名『夥伴』」；hosting 重部署；commit `17eeedb`。③ 正式環境 app 集合歸零——purge `checkins`／`player_progress`（保留 508 roster、redeem 維持 0），清除前期測試污染。④ stage 1 題目改為《天鵝湖》作曲家題、正解 **C（柴可夫斯基）**：後端 `state/game.ts` `c1 correctChoiceId` `B→C`＋前端 `stageQuestions.ts` 題庫＋對應單元測試；`functions:api`＋hosting 重部署；commit `384c78c`。測試計數更新：前端 **19** 檔／**131**、後端 **5** 檔／**29**；**`project-master` v1.3.69`**。**2026-05-29（壓測管線上線並完成 1,300／3,000 VU 雙輪驗證）：** 後端 `src/index.ts` 側掛 **`apiLoadtest`** export（同專案下用 `loadtest` 具名 Firestore database，per-request 覆寫 `FDGW_FIRESTORE_DATABASE_ID`，正式 `api` 與 `(default)` db 完全不干擾）；新增 3 支壓測腳本 `scripts/{generate-loadtest-roster,loadtest-consistency-check,delete-player-progress}.mjs`。**k6 第一輪 1,300 VU × 10× hot-doc**（員編池 130、ramp 5/sustain 10/ramp-down 3 min）：checks **99.99%**、`http_req_failed` **0.00%**、p(95) **1.0 s**、428,232 reqs、Cloud Run 自然 scale up；post-test 一致性檢查 130 個 `player_progress` doc 全 `[1..6]`、**0 partial → 0 RMW race**。**同日加碼 3,000 VU × 23× hot-doc 極限測試**：checks **99.96%**、failed **0.03%**、p(95) **1.06 s**、969,502 reqs、873 RPS（線性 scale），同樣 **0 partial doc**——Firestore 超出 1 wps/doc soft limit 至 2.4 wps 仍未見 race。額外驗證 `/me/playthrough/restart` 不重置 `rewardRedeemCount`，但用 `delete-player-progress.mjs` 刪 doc → 下次 `getOrInitProgress` 以 `defaultProgress()` 重生 → **不改 backend code 即可達成「玩家硬重置」**；commit `f8ccad3`；**`project-master` v1.3.70`**。

| 面向 | 現況 |
|------|------|
| 前端 | 10 個 View **全數完整實作**（WelcomeView → FinishView；舊 **`/finish/claimed`** 僅 redirect **`/finish`**）；API 層 12 支函式對應真實端點（含 `auth/me`）；19 個測試檔無 skip/stub；CI 通過；**登入態以 `localStorage` token 跨分頁共享**，呼叫同送 `Authorization: Bearer`＋cookie（`credentials:include`），未登入時 `/auth/me` 探測回填身分（`src/lib/sessionToken.ts`、`src/api/authMe.ts`）；**外部 QR scanner 進入點 `/scan`**（`src/lib/scanEntry.ts` + `qrPayload.ts`） |
| API | **19** 個端點均已實作。**`GET /admin/reports/attendance`**：**`total`**＝Firestore **`roster`**（現行 **`eventId`** 下名冊筆數）；**`checkedIn`**＝**`checkins`** 計數。**`GET /admin/reports/progress`**：**`redeemed`** 取自核銷摘要；**`players`／`fullClear`** 仍為 **`admin.ts`** 占位常數（待對齊 `player_progress` 聚合） |
| 後端資料層 | roster / checkins / player_progress / redeem 四集合已完整實作 Firestore + in-memory 雙模式切換；**Firestore IAM 憑證已設定**（2026-05-19） |
| 測試 | 前端 Vitest **19** 檔／**131** 測試通過（含 `qrPayload`／`scanEntry`／`/scan`／`/reward` redirect／`resultAction`／`claimPayload`／`authMe`）；後端 Vitest **5** 檔／**29** 測試通過；`verify:firestore` 正式端點 **PASS**（2026-05-19）；**報到＋闖關＋ResultView 三向分流＋領獎入口＋FinishView 防誤領掃 QR 全部於正式環境手動驗證 Pass**（2026-05-19、2026-05-20） |
| 部署 | **正式 `familyday-greenworld.web.app` 為現行主環境**（Functions `api-jwvq2npioq-uc.a.run.app`）；長期壓測入口 **`apiLoadtest`**（同專案、`loadtest` 具名 db、idle 0 instance 不計費）；2026-05-26 已將 `dev` 全部變更部署並驗證、app 集合歸零（roster 508 保留）；測試環境 `rare-lattice-495009-i9.web.app`（`api-hxe6k6ncza`）保留；正式上線仍須完成 Security Rules（`firestore.rules` 仍 deny-all）／安全基線（**1,300 人 k6 壓測已於 2026-05-29 PASS** ✓） |

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

*README v2.94 · 2026-05-29（`apiLoadtest` 側掛 export ＋ 載入測試工具鏈 `f8ccad3`；k6 1,300 VU × 10× hot-doc PASS [99.99% / failed 0.00% / p95 1.0 s]；3,000 VU × 23× hot-doc 極限測試 PASS [99.96% / failed 0.03% / p95 1.06 s]；兩輪皆 0 partial doc / 0 RMW race；前版 v2.93）*
