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

### 1.1 單一真實來源（**以 API + 實作為準**）

**優先順序（由高到低）：**

1. **`docs/specs/api-v0.1.md`** — REST 契約與行為。  
2. **`functions/src/state/*.ts`**（及路由處理程式）— 實際寫入／讀取的欄位與文件 ID。  
3. **前端** — 呼叫上述 API 的流程與呈現（`docs/architecture/summary-frontend.md`）。  
4. **Firestore Console** — 用來**核對實作結果**，不作為反向定義 schema 的主來源（避免與程式漂移時誤判）。

**目前 Cloud Functions（`FDGW_USE_FIRESTORE=true`）已使用的頂層集合（與 Console 一致）：**

```text
roster/{eventId_employeeId}
checkins/{employeeId}
player_progress/{employeeId}
redeem_tokens/{tokenId}
redeem_records/{redeemId}
```

實作參考：`functions/src/state/roster.ts`、`checkins.ts`、`game.ts`、`redeem.ts`。

### 1.2 遠端 Firestore「可部署項目」（Rules / Indexes）

Firestore **沒有**遠端 SQL 那種「上傳整份 schema」；文件欄位隨 **API／Functions** 寫入自然形成。  
**可對遠端專案版本控並部署的**主要是：

| 項目 | 倉庫檔案 | 說明 |
|------|----------|------|
| Security Rules | 根目錄 `firestore.rules` | 目前為 **全面關閉直接讀寫**（僅 API + Admin SDK 路徑）；若未來前端改用 Client SDK 讀 Firestore，再分集合放寬。 |
| 複合索引 | 根目錄 `firestore.indexes.json` | 目前為空陣列；若查詢出現「需要建立索引」連結，再把索引條目加進此檔後部署。 |
| Firebase 設定 | `firebase.json` | 已掛上 `firestore.rules` 與 `firestore.indexes.json`。 |

**部署指令**（在倉庫根目錄、已 `firebase login` 且 `.firebaserc` 指向目標專案）：

```bash
firebase deploy --only firestore
```

僅部署規則：`firebase deploy --only firestore:rules`；僅索引：`firebase deploy --only firestore:indexes`。  
**若要做「改文件 ID／搬集合」等結構遷移**，需另寫 migration 腳本與停機／雙寫策略，無法只靠上述指令完成。

**清空應用資料（dev 重置）**：`functions` 內 `npm run purge:firestore-app`（腳本 `scripts/purge-firestore-app-data.mjs`）。**必須**同時設定 `FDGW_PURGE_CONFIRM=YES` 與 `FDGW_EXPECT_PROJECT_ID=<金鑰內 project_id>`，否則拒絕執行。預設清空集合：`redeem_tokens`、`redeem_records`、`player_progress`、`checkins`、`roster`；可選 `FDGW_PURGE_COLLECTIONS` 覆寫。清空後通常再接 `npm run seed:roster` 與 API 驗證流程。

---

## 2) Collections 結構（演進草案 · 非全部已落地）

以下為**較完整、含 eventId 複合鍵**的演進方向；**與 §1.1 實作並列時，以 §1.1 為準**，收斂時再遷移資料或調整程式。

```text
events/{eventId}
events/{eventId}/stages/{stageId}

users/{uid}
roster/{eventId_employeeId}

checkins/{eventId_employeeId}   ← 實作目前為 checkins/{employeeId}，見 §3.5
progress/{eventId_employeeId} ← 實作目前為 player_progress/{employeeId}，見 §3.6 註記
attempts/{eventId_employeeId_challengeId_timestamp}

redeemTokens/{tokenId}        ← 實作為 redeem_tokens
redeems/{eventId_employeeId_redeemSeq}  ← 實作為 `redeem_records`（**每筆核銷一文件**，文件 ID = `redeemId`；見 §3.9b）
```

> 以下為推論：`users/{uid}` 採 Firebase Auth UID 為主鍵；業務比對鍵仍保留 `employeeId`。

---

## 3) 文件欄位規格

## 3.1 `events/{eventId}`

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | yes | 活動顯示名稱 |
| `status` | string | yes | `draft` / `active` / `closed` |
| `maxRounds` | number | yes | 演進草案欄位名；語意上可對齊「闖關禮領取上限」；**與 §3.6 `player_progress.maxRounds` 命名相同但集合不同**（後者實作為**領獎次數上限**，非「可玩輪數」） |
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

## 3.5 `checkins/{employeeId}`（**目前實作**）

> 與 Console 截圖一致：`familyday-greenworld-dev` → `checkins` → 文件 **`1141043`** 內含 `checkinAt`、`employeeId`、`name`、`partySize`。  
> 文件 ID = **`employeeId`**（單一活動假設下未再複合 `eventId`；多活動並存時建議另議遷移至複合鍵，見 §2 草案）。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `employeeId` | string | yes | 員工編號（與文件 ID 相同） |
| `name` | string | yes | 報到姓名 |
| `partySize` | number | yes | 同行人數 |
| `checkinAt` | string | yes | 報到時間（**ISO 8601 字串**，由 `CheckinRecord` 寫入） |

程式型別：`functions/src/state/checkins.ts` 之 `CheckinRecord`。

API 對應：`POST /api/v1/checkin`、`GET /api/v1/checkin/status`

## 3.5b `checkins/{eventId_employeeId}`（演進草案 · 尚未實作）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `name` | string | yes | 報到姓名 |
| `partySize` | number | yes | 同行人數 |
| `checkedInAt` | timestamp | yes | 報到時間 |
| `checkinSource` | string | yes | `qr` / `manual` |

## 3.6 `player_progress/{employeeId}`（**目前實作**）

文件 ID = **`employeeId`**。欄位與 `functions/src/state/game.ts` 之 `PlayerProgress` 一致（文件中**不含** `eventId`／`updatedAt`／`allCompleted`／`canStartNewRound`；後兩者由 API 組裝）。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `currentStageId` | number | yes | 目前關卡 |
| `completedStageIds` | array<number> | yes | 已完成關卡（**答對順序不拘**；集滿相異 1–6 即一輪全通，供 `bankedFullClears` 與領獎判斷） |
| `fullClearCount` | number | yes | 曾按下「再玩一輪」且當時已全通關之次數（可無限累加，僅統計） |
| `bankedFullClears` | number | yes | 累計「整輪六關全通關」次數；領獎需 **`bankedFullClears > rewardRedeemCount`** 且 **`rewardRedeemCount < maxRounds`** |
| `rewardRedeemCount` | number | yes | 已於 Finish 領獎計次之次數（上限見 `maxRounds`） |
| `maxRounds` | number | yes | **闖關禮最多可領次數**（預設 3）；闖關重玩本身不限次數 |

API 對應：`GET /api/v1/me/dashboard`、`POST /api/v1/me/playthrough/restart`、`POST /api/v1/challenges/{id}/attempts`（通關時可遞增 `bankedFullClears`）、`POST /api/v1/me/reward/claim`

## 3.6b `progress/{eventId_employeeId}`（演進草案 · 尚未實作）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `eventId` | string | yes | 活動 ID |
| `employeeId` | string | yes | 員工編號 |
| `currentStageId` | number | no | 目前關卡 |
| `completedStageIds` | array<number> | yes | 已完成關卡（**答對順序不拘**；集滿相異 1–6 即一輪全通，供 `bankedFullClears` 與領獎判斷） |
| `allCompleted` | boolean | yes | 本輪是否全通關 |
| `fullClearCount` | number | yes | 「再玩一輪」次數（演進草案；實作見 §3.6） |
| `bankedFullClears` | number | yes | 整輪通關累計（演進草案；實作見 §3.6） |
| `rewardRedeemCount` | number | yes | 已領獎計次 |
| `canStartNewRound` | boolean | yes | 是否可再開一輪 |
| `maxRounds` | number | yes | 領獎次數上限（演進草案；實作見 §3.6） |
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

## 3.9b `redeem_records/{redeemId}`（**目前實作**）

> 與 §3.9 演進草案對齊：以 **`redeemId`** 為文件主鍵，同一 `employeeId` 可有多筆（第幾次領獎由 **`player_progress.rewardRedeemCount`** 與本集合筆數共同反映；上限為 **`maxRounds`**）。  
> **`POST /api/v1/staff/redeem/confirm`** 成功時，後端以 **transaction** 寫入本文件、**遞增** `player_progress/{employeeId}` 的 `rewardRedeemCount`，並刪除已使用之 `redeem_tokens/{tokenId}`。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `redeemId` | string | yes | 與文件 ID 相同 |
| `employeeId` | string | yes | 玩家員編 |
| `staffId` | string | yes | 核銷工作人員代號 |
| `confirmedAt` | string | yes | 核銷時間（**ISO 8601 字串**） |

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
| `POST /api/v1/me/reward/claim` | `progress`（寫，遞增 `rewardRedeemCount`） |
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
| `/finish` Modal 確認領獎 | `POST /api/v1/me/reward/claim` | `player_progress`（寫） |
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
- ~~`redeemSeq` 與 `rewardRedeemCount`~~：`confirmRedeem` 已以 Firestore transaction 同步寫入 `redeem_records` 並遞增 `rewardRedeemCount`（見 `functions/src/state/redeem.ts`）。

