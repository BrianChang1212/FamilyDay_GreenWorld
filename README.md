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

核心入口：

| 用途 | 連結 |
|------|------|
| **全系統架構圖（前端 + API + 後端）** | [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md) |
| 需求／待辦／狀態（主文件） | [`docs/project/project-master.md`](docs/project/project-master.md) |
| 本機與預覽 | [`docs/setup/README.md`](docs/setup/README.md) |
| API v0.1 | [`familyday-api-contract/api-v0.1.md`](familyday-api-contract/api-v0.1.md) |
| `docs/` 索引 | [`docs/README.md`](docs/README.md) |

---

<a id="readme-live-progress"></a>

## 即時進度（工作來源之一）

> **工作約定：** **本表**為**進度現況**之**權威**來源（View／API 函式數／測試檔數等）。**待辦勾選與完整行動清單**以 [`docs/project/project-master.md` § 待辦事項](docs/project/project-master.md#work-backlog) 為準。

> 2026-05-11 依原始碼掃描更新；同日 **對齊**後端：`admin/reports/attendance` 之 **`total`／`checkedIn`**、`admin/reports/progress` **占位欄位**見 [`familyday-backend/src/routes/admin.ts`](familyday-backend/src/routes/admin.ts)。

| 面向 | 現況 |
|------|------|
| 前端 | 10 個 View **全數完整實作**（WelcomeView → FinishView；舊 **`/finish/claimed`** 僅 redirect **`/finish`**）；API 層 11 支函式對應真實端點；14 個測試檔無 skip/stub；CI 通過 |
| API | **19** 個端點均已實作。**`GET /admin/reports/attendance`**：**`total`**＝Firestore **`roster`**（現行 **`eventId`** 下名冊筆數）；**`checkedIn`**＝**`checkins`** 計數。**`GET /admin/reports/progress`**：**`redeemed`** 取自核銷摘要；**`players`／`fullClear`** 仍為 **`admin.ts`** 占位常數（待對齊 `player_progress` 聚合） |
| 後端資料層 | roster / checkins / player_progress / redeem 四集合已完整實作 Firestore + in-memory 雙模式切換；阻塞點為本機 IAM 憑證未設定（`GOOGLE_APPLICATION_CREDENTIALS`） |
| 測試 | 前端 Vitest **14** 檔通過（與上列「前端」列一致）；後端 4/30 聯調驗證 Pass 17（in-memory）；Firestore 驗證 Blocked（憑證未設定）；後端單元測試待補齊 |
| 部署 | dev/stage 可驗證上架；正式上線需先完成 Firestore IAM 憑證設定、Security Rules 與安全基線 |

---

## 待辦與進度（摘要）

- **待確認／里程碑表／技術選型細節／下一步完整條列** → [`docs/overview/root-readme-supplement.md#backlog-detail`](docs/overview/root-readme-supplement.md#backlog-detail)
- **主文件（權威待辦）** → [`docs/project/project-master.md` § 待辦事項](docs/project/project-master.md#work-backlog)

**本週摘要（與主文件對齊；勾選以 `project-master` 為準）**

- **高優先：** Firestore IAM、`verify:firestore`、回填 `api-integration-checklist`、安全基線清單、`VITE_API_BASE`／CORS
- **中優先：** runbook、Security Rules、後端單元測試、**補強 `GET …/admin/reports/progress`（`players`／`fullClear`）聚合**  
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

*README v2.65 · 2026-05-11（`admin/reports` 與後端對齊；前版 v2.64）*
