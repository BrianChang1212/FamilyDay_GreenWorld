# API 整合驗證歷史紀錄

> 本檔保留歷次實測紀錄與 Go/No-Go 判定。  
> 日常測試請優先使用精簡主清單：[`api-integration-checklist.md`](./api-integration-checklist.md)。

## 最新執行紀錄

> 填寫規則：每次整合測試新增一列；證據可填 PR、報告、截圖或 HAR。

> 對照說明：歷史列可能含舊 `GOOGLE_CLOUD_PROJECT`。目前預設以
> [`fdgw.project.json`](../../fdgw.project.json) 與 [`.firebaserc`](../../.firebaserc)
> 為準。

| 執行日期 | 環境 | Seed 版本 | 範圍（章節） | Pass | Fail | Blocked | 證據連結 | 執行者 | 備註 |
|----------|------|-----------|--------------|------|------|---------|----------|--------|------|
| 2026-04-30 | dev (Functions + Firestore verification script) | ADC (`C:\Users\Brian Chang\AppData\Roaming\gcloud\application_default_credentials.json`) | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `FDGW_USE_FIRESTORE=true` + `GOOGLE_CLOUD_PROJECT=familyday-greenworld-dev` + `GOOGLE_APPLICATION_CREDENTIALS=...` 後執行 `npm run verify:firestore`：`7 PERMISSION_DENIED: Permission denied on resource project familyday-greenworld-dev.`；`npx firebase login:list` 顯示 `No authorized accounts` | Codex | Blocked 仍存在：需先完成目標專案 IAM 授權並完成 Firebase CLI/GCP 身份對齊 |
| 2026-04-30 | dev (Functions + Firestore verification script) | ADC (`application_default_credentials.json`) | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `npm run verify:firestore`：先缺 Project ID，補 `GOOGLE_CLOUD_PROJECT` 後回 `PERMISSION_DENIED` | Codex | Blocked: Firestore IAM permission pending（已建憑證，待專案授權） |
| 2026-04-30 | dev (Functions + Firestore verification script) | `functions/scripts/verify-firestore-flow.mjs` | 0, 3, 5（Firestore 真切換驗證） | 0 | 0 | 1 | `npm run verify:firestore` -> 缺 `FDGW_USE_FIRESTORE`；啟用後缺 `GOOGLE_APPLICATION_CREDENTIALS` | Codex | Blocked: Firestore IAM permission pending（流程已建置，可直接重跑） |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1, 6(CORS allowlist) | 3 | 0 | 0 | CORS 驗證：allowlist `netlify` 回 `200 + ACAO`；非白名單 `evil.example.com` 回 `500` 且無 ACAO | Codex | CORS allowlist 已收斂；白名單含 localhost:5173/4173、Netlify、GitHub Pages |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1~5 + 6(401/409/CORS) | 17 | 0 | 1 | CLI：`health/ready/login/me/checkin/status/stations/challenges/attempts/dashboard/staff/admin` + 回歸 `source test/build`、`functions build` | Codex | 核心流程可用；**CORS allowlist 未收斂**（`Origin: https://evil.example.com` 仍回 `Access-Control-Allow-Origin`） |
| 2026-04-30 | dev (Functions Emulator) | in-memory roster (`functions/src/data/employees.ts`) | 1, 2.2, 3, 6(401 基本驗證) | 8 | 0 | 0 | CLI 驗證：`health/ready/login/me/checkin/status/dashboard` 皆 200，未登入 `auth/me` 為 401 | Codex | 第一階段僅驗 MVP 端點；stations/challenges/restart/staff/admin 待下一階段 |
| 2026-04-30 | dev (Functions Emulator, port 5003) | in-memory (`functions/src/state/*.ts`) | 1, 3, 4, 5, 6 | 13 | 0 | 0 | CLI 驗證：`stations/verify`、`challenges/*`、`restart(409)`、`staff/redeem/*`、`admin/reports/*` 皆符合預期 | Codex | 第二階段端點已落地（in-memory）；JWT 驗簽/Firestore 仍待下一階段 |
| <!-- YYYY-MM-DD --> | <!-- dev/stage --> | <!-- seed tag --> | <!-- 1~6 / 全部 --> | <!-- n --> | <!-- n --> | <!-- n --> | <!-- link/path --> | <!-- owner --> | <!-- note --> |

## 當前結論（Go/No-Go）

- **Go（dev/stage）**：前端 + API + 後端（in-memory）整合可運作。
- **Conditional Go（Firestore）**：流程就緒，但 IAM 未完成前不算 fully verified。
- **No-Go（正式）**：若 IAM 與安全基線未完成，不可對外上線。
- **Blocked 標準用語**：`Firestore IAM permission pending`。
