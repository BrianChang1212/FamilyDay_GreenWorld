# 每日 checkins／player_progress 自動匯出寄信（Cloud Scheduler）

每天自動把 Firestore `(default)` 的當天資料 dump 成兩個 CSV，寄到內部信箱。**全雲端執行，不需本機觸發**。

## 規格

| 項目 | 值 |
|------|----|
| 函式 | `dumpCheckinsDaily`（Firebase Functions v2 `onSchedule`，`us-central1`）|
| 觸發 | 每天 **08:00 Asia/Taipei**（部署時自動建立 Cloud Scheduler job + Pub/Sub）|
| 來源 | Firestore `(default)`：`checkins`、`player_progress`（姓名由 `roster` 依員編 join）|
| 寄件 | `familyday.amtran@gmail.com` → `familyday.amtran@amtran.com.tw`（nodemailer / Gmail SMTP 465）|
| 密鑰 | Secret Manager `GMAIL_APP_PASSWORD`（Gmail App 密碼；**不進 git**）|

## 附件（對齊「家庭日當天資料紀錄表.xlsx」）

CSV 皆為 UTF-8 BOM、時間轉台北「YYYY-MM-DD HH:mm:ss」。

| 檔名 | 欄位 | 來源 |
|------|------|------|
| `報到紀錄表-YYYY-MM-DD.csv` | 工號 / 姓名 / 報到時間 / 攜伴人數(不含本人) | `checkins`（依報到時間排序）|
| `闖關遊戲紀錄表-YYYY-MM-DD.csv` | 工號 / 姓名 / 領獎次數 / 領獎時間一 / 二 / 三 | `player_progress`（`rewardRedeemCount` + `rewardRedeemAt[]`；姓名 join `roster`；依工號排序）|

## 程式碼

- `familyday-backend/src/scheduled/dumpCheckins.ts` — `onSchedule` handler：讀 Firestore + 寄信（I/O）
- `familyday-backend/src/scheduled/dumpReport.ts` — `buildDailyDumpReport()`：組裝主旨／內文／兩 CSV（純函式，可測）
- `familyday-backend/src/scheduled/checkinCsv.ts`、`progressCsv.ts` — 各 sheet 的純 CSV builder
- 測試：`familyday-backend/test/scheduled/{checkinCsv,progressCsv,dumpReport}.test.ts`

## 首次設定 / 變更密碼

1. 在 `familyday.amtran@gmail.com`（需開兩步驟驗證）產生 16 碼 App 密碼：<https://myaccount.google.com/apppasswords>
2. 寫入 Secret Manager（密碼只進 Secret、不經程式碼）：
   ```powershell
   cd D:\Brian\projects\Personal\20260410_FamilyDay_GreenWorld_App\familyday-backend
   npx firebase-tools functions:secrets:set GMAIL_APP_PASSWORD --project=production
   ```
3. 部署：
   ```powershell
   npx firebase-tools deploy --only functions:dumpCheckinsDaily --project=production
   ```

## 手動測試（不用等 08:00）

**A. Console 強制執行**：Cloud Scheduler → job `firebase-schedule-dumpCheckinsDaily-us-central1` → ⋮ →「強制執行」。

**B. 無 gcloud 時，用 SA 以 REST 觸發**（SA 見 `.secrets/`，需 `cloudscheduler.jobs.run` 權限）：
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "D:\Brian\projects\Personal\20260410_FamilyDay_GreenWorld_App\familyday-backend\.secrets\familyday-greenworld-d90c35ca2fdd.json"
# 取 access token 後 POST：
#   https://cloudscheduler.googleapis.com/v1/projects/familyday-greenworld/locations/us-central1/jobs/firebase-schedule-dumpCheckinsDaily-us-central1:run
```

**查執行結果**：
```powershell
npx firebase-tools functions:log --only dumpCheckinsDaily --project=production
# 成功會看到：{"message":"dumpCheckinsDaily sent","checkinCount":N,"progressCount":M,...}
```

## 調整

- **時間 / 收件者 / 寄件者**：改 `dumpCheckins.ts` 的 `schedule`、`RECIPIENT`、`SENDER` 後重佈。
- **欄位 / 格式**：改 `checkinCsv.ts` / `progressCsv.ts`（有單元測試守住格式）。

## 注意

- 附件含**真實個資**（員編＋姓名），僅供內部使用、勿外流。
- App 密碼若外洩：到 Google 帳戶刪除該組 App 密碼重產，再 `functions:secrets:set` 更新即可（不影響其他登入）。
