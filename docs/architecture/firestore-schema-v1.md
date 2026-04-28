# Firestore Schema v1（草案）

> 適用專案：FamilyDay_GreenWorld  
> 後端基線：Firebase（Firestore 為主，Realtime Database 視場景選用）  
> 對齊文件：`docs/specs/api-v0.1.md`、`docs/architecture/summary-backend.md`

---

## 1) 設計原則

- 以 Firestore 查詢路徑為中心，不採關聯式 JOIN 設計。
- 玩家主流程（報到、闖關、領獎）優先對齊 `GET /api/v1/me/dashboard` 單次回傳需求。
- 依目前定案採 **作法 A**：不建立獨立 `runs` 表，以單一進度文件搭配累計欄位表達輪次。
- 權限與資料驗證由 Firestore Security Rules + 後端 API 層共同防護。

---

## 2) Collections 結構（建議）

```text
events/{eventId}
events/{eventId}/stages/{stageId}

users/{uid}
roster/{eventId_employeeId}

checkins/{eventId_employeeId}
progress/{eventId_employeeId}
attempts/{eventId_employeeId_challengeId_timestamp}

redeemTokens/{tokenId}
redeems/{eventId_employeeId_redeemSeq}
```

> 以下為推論：`users/{uid}` 採 Firebase Auth UID 為主鍵；業務比對鍵仍保留 `employeeId`。

---

## 3) 文件欄位規格

## 3.1 `events/{eventId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | yes | 活動顯示名稱 |
| `status` | string | yes | `draft` / `active` / `closed` |
| `maxRounds` | number | yes | 玩家可完成輪次上限（目前規則 3） |
| `startsAt` | timestamp | no | 活動開始時間 |
| `endsAt` | timestamp | no | 活動結束時間 |
| `updatedAt` | timestamp | yes | 最後更新時間 |

API 對應：`GET /api/v1/events/{eventId}`

## 3.2 `events/{eventId}/stages/{stageId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `title` | string | yes | 關卡名稱 |
| `order` | number | yes | 顯示順序 |
| `enabled` | boolean | yes | 是否啟用 |
| `challengeId` | string | no | 題目主鍵（若分離 challenges 集合可保留引用） |

API 對應：`GET /api/v1/me/dashboard`、`GET /api/v1/challenges/{challengeId}`

## 3.3 `users/{uid}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `employeeId` | string | yes | 員工編號（唯一業務鍵） |
| `name` | string | yes | 顯示名稱 |
| `role` | string | yes | `player` / `staff` / `admin` |
| `active` | boolean | yes | 是否有效 |
| `createdAt` | timestamp | yes | 建立時間 |
| `updatedAt` | timestamp | yes | 更新時間 |

API 對應：`POST /api/v1/auth/login`、`GET /api/v1/auth/me`

## 3.4 `roster/{eventId_employeeId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `name` | string | yes | 名冊姓名 |
| `partySizePlanned` | number | no | 報名前置人數（若有） |
| `source` | string | yes | `import` / `manual` |
| `updatedAt` | timestamp | yes | 更新時間 |

API 對應：`POST /api/v1/admin/roster/import`、`POST /api/v1/checkin` 身分比對

## 3.5 `checkins/{eventId_employeeId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `name` | string | yes | 報到姓名 |
| `partySize` | number | yes | 同行人數 |
| `checkedInAt` | timestamp | yes | 報到時間 |
| `checkinSource` | string | yes | `qr` / `manual` |

API 對應：`POST /api/v1/checkin`、`GET /api/v1/checkin/status`

## 3.6 `progress/{eventId_employeeId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `currentStageId` | number | no | 目前關卡 |
| `completedStageIds` | array<number> | yes | 已完成關卡 |
| `allCompleted` | boolean | yes | 本輪是否全通關 |
| `fullClearCount` | number | yes | 已全通關輪次 |
| `rewardRedeemCount` | number | yes | 已核銷領獎次數 |
| `canStartNewRound` | boolean | yes | 是否可再開一輪 |
| `maxRounds` | number | yes | 最大輪次（預設 3） |
| `updatedAt` | timestamp | yes | 更新時間 |

API 對應：`GET /api/v1/me/dashboard`、`POST /api/v1/me/playthrough/restart`

## 3.7 `attempts/{eventId_employeeId_challengeId_timestamp}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `challengeId` | string | yes | 題目 ID |
| `answer` | string | yes | 作答內容 |
| `correct` | boolean | yes | 是否答對 |
| `createdAt` | timestamp | yes | 嘗試時間 |

API 對應：`POST /api/v1/challenges/{challengeId}/attempts`

## 3.8 `redeemTokens/{tokenId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 玩家員編 |
| `expiresAt` | timestamp | yes | token 過期時間 |
| `used` | boolean | yes | 是否已使用 |
| `issuedAt` | timestamp | yes | 建立時間 |
| `issuedBy` | string | yes | staff UID |

API 對應：`POST /api/v1/staff/redeem/token`

## 3.9 `redeems/{eventId_employeeId_redeemSeq}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 玩家員編 |
| `redeemSeq` | number | yes | 第幾次領獎（1..3） |
| `tokenId` | string | yes | 對應 redeem token |
| `confirmedBy` | string | yes | staff UID |
| `confirmedAt` | timestamp | yes | 核銷時間 |

API 對應：`POST /api/v1/staff/redeem/confirm`

---

## 4) 索引建議（Firestore Indexes）

> 以下為推論：依目前 API 與報表需求，先建立最低必要索引。

- `checkins`: `eventId ASC, checkedInAt DESC`（出席報表）
- `progress`: `eventId ASC, fullClearCount DESC, updatedAt DESC`（闖關統計）
- `attempts`: `eventId ASC, employeeId ASC, createdAt DESC`（審計追查）
- `redeems`: `eventId ASC, confirmedAt DESC`（核銷報表）

---

## 5) Security Rules 草稿框架（v1）

> 以下為草稿範本，需依實際 auth claim 與欄位命名調整。

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isStaff() { return isSignedIn() && request.auth.token.role in ['staff', 'admin']; }
    function isAdmin() { return isSignedIn() && request.auth.token.role == 'admin'; }

    // 玩家僅可讀寫自己的 checkin/progress
    match /checkins/{id} {
      allow read, write: if isSignedIn()
        && request.resource.data.employeeId == request.auth.token.employeeId;
    }
    match /progress/{id} {
      allow read, write: if isSignedIn()
        && request.resource.data.employeeId == request.auth.token.employeeId;
    }

    // 核銷僅 staff/admin
    match /redeemTokens/{id} {
      allow read, write: if isStaff();
    }
    match /redeems/{id} {
      allow read, write: if isStaff();
    }

    // 名冊匯入與報表僅 admin
    match /roster/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

> 注意：Server SDK 會繞過 Rules，正式環境仍需搭配 IAM 與後端 API 層驗證。

---

## 6) API ↔ Firestore 對照（摘要）

| API | 主要讀寫文件 |
|-----|--------------|
| `POST /api/v1/checkin` | `roster`（讀）+ `checkins`（寫） |
| `GET /api/v1/checkin/status` | `checkins`（讀） |
| `POST /api/v1/auth/login` | `users` / `roster`（讀） |
| `GET /api/v1/me/dashboard` | `events/stages` + `progress`（讀） |
| `POST /api/v1/stations/verify` | （建議）`events/stages`（讀）+ JWT 驗簽 |
| `POST /api/v1/challenges/{id}/attempts` | `attempts`（寫）+ `progress`（寫） |
| `POST /api/v1/me/playthrough/restart` | `progress`（寫） |
| `POST /api/v1/staff/redeem/token` | `redeemTokens`（寫） |
| `POST /api/v1/staff/redeem/confirm` | `redeemTokens`（讀寫）+ `redeems`（寫）+ `progress`（寫） |
| `POST /api/v1/admin/roster/import` | `roster`（寫） |
| `GET /api/v1/admin/reports/attendance` | `checkins`（讀） |
| `GET /api/v1/admin/reports/progress` | `progress` / `redeems`（讀） |

---

## 6.1) 前端頁面路由 ↔ API ↔ Firestore 對照

| 前端頁面路由（或操作） | API | Firestore 文件（主） |
|-----|-----|-----|
| `/check-in` -> `/checkin`（送出報到） | `POST /api/v1/checkin` | `roster`（讀比對）+ `checkins`（寫） |
| `/checkin`（查報到狀態） | `GET /api/v1/checkin/status` | `checkins`（讀） |
| `/register`（闖關登入） | `POST /api/v1/auth/login` | `users` / `roster`（讀） |
| App 初始化或頁面重整（登入態恢復） | `GET /api/v1/auth/me` | `users`（讀） |
| `/stage` / `/finish/claimed`（進度與領取狀態顯示） | `GET /api/v1/me/dashboard` | `events/stages` + `progress`（讀） |
| 掃站點 QR（到站驗證） | `POST /api/v1/stations/verify` | `events/stages`（讀，另含 JWT 驗簽） |
| 題目頁載入 | `GET /api/v1/challenges/{challengeId}` | `events/stages` / 題庫文件（讀） |
| 題目作答送出 | `POST /api/v1/challenges/{challengeId}/attempts` | `attempts`（寫）+ `progress`（寫） |
| `/finish` 再玩一輪 | `POST /api/v1/me/playthrough/restart` | `progress`（寫） |
| 櫃台核銷啟動 | `POST /api/v1/staff/redeem/token` | `redeemTokens`（寫） |
| 櫃台確認領獎 | `POST /api/v1/staff/redeem/confirm` | `redeemTokens`（讀寫）+ `redeems`（寫）+ `progress`（寫） |
| 後台名冊匯入 | `POST /api/v1/admin/roster/import` | `roster`（寫） |
| 後台出席報表 | `GET /api/v1/admin/reports/attendance` | `checkins`（讀） |
| 後台闖關報表 | `GET /api/v1/admin/reports/progress` | `progress` / `redeems`（讀） |

> 註：`/finish/claimed` 在前端目前可有 `local-fallback`；正式上線仍以
> `GET /api/v1/me/dashboard` 回傳之 `progress` 欄位為準。

---

## 7) 待定事項（TODO）

- <!-- TODO: 定義 `users/{uid}` 與 `employeeId` 的唯一對應策略（是否允許改綁） -->
- <!-- TODO: 定義 `role` claim 寫入來源（Auth custom claims 或 users 文件） -->
- <!-- TODO: 定義 `attempts` 保留天數與冷資料歸檔策略 -->
- <!-- TODO: 定義 `redeemSeq` 與 `rewardRedeemCount` 一致性保證（transaction 邏輯） -->

