# iOS 行動裝置無法進入關卡問題排查與修復報告

**日期：** 2026-05-13
**影響範圍：** 所有 iOS 行動裝置（Safari、Chrome、無痕模式）
**狀態：** 已解決 ✅  
**契約對齊：** [`docs/api/api-v0.1.md`](../api/api-v0.1.md) **v0.1.25–v0.1.26**（Bearer／登入 JSON 形狀）。

---

## 結論（Summary）

iOS 所有瀏覽器在掃描關卡 QR Code 後，一律顯示「尚未登入或連線已失效」錯誤，PC 端則完全正常。根本原因是 **Session 驗證機制依賴 HTTP-only Cookie**，而 iOS Safari 的 ITP（Intelligent Tracking Prevention）與 Firebase Hosting CDN 均會封鎖跨網域 Cookie（`firebaseapp.com` ↔ `run.app`）。

解決方案為**將驗證機制從 Cookie 改為 `Authorization: Bearer` Header + `sessionStorage` Token**，完全繞開 Cookie 的跨瀏覽器限制，一次性修復 iOS Safari、iOS Chrome、無痕模式等所有情境。

---

## 技術細節（Technical Details）

### 1. 問題架構背景

| 角色 | 網域 |
|------|------|
| Frontend（Firebase Hosting） | `rare-lattice-495009-i9.firebaseapp.com` |
| Backend API（Cloud Run / Functions v2） | `api-hxe6k6ncza-uc.a.run.app` |

兩個服務位於不同的 eTLD+1（`firebaseapp.com` vs `run.app`），所有 API 請求均為 **cross-site**。

### 2. 原始驗證機制（有問題）

後端登入成功後設定 HTTP-only Cookie：

```
Set-Cookie: fdgw_session=<token>; Path=/; HttpOnly; SameSite=None; Secure
```

前端所有 API 請求使用 `credentials: "include"` 帶出 Cookie。

**問題點：**

| 環境 | 問題原因 |
|------|---------|
| iOS Safari（預設） | ITP（Intelligent Tracking Prevention）封鎖第三方 Cookie |
| iOS Chrome | 底層同為 WebKit，受相同限制影響 |
| iOS 無痕模式 | 完全不存任何第三方 Cookie |
| Firebase Hosting Rewrite（嘗試過） | CDN 轉發時只保留名稱為 `__session` 的 Cookie，其餘全部剝除 |

**驗證方式：** 在 iOS 設定 → Safari → 關閉「防止跨網站追蹤（ITP）」後，Safari 可正常進入關卡，確認根本原因為 Cookie 跨域封鎖。

### 3. 中間嘗試的方案（失敗）

#### 方案一：Firebase Hosting Rewrite + `VITE_API_BASE=""`

- 在 `firebase.json` 新增 `/api/**` → Function rewrite，使 API 請求變成 same-origin
- 將 Cookie 名稱從 `fdgw_session` 改為 `__session`（Firebase 唯一保留的 Cookie）
- **結果失敗：** Firebase Hosting CDN 的 Cookie 轉發行為不如預期，rewrite 後問題依然存在，且破壞了原有的 ITP 關閉後可用的 workaround

### 4. 最終解決方案：Authorization Bearer Token

#### 架構改變

```
舊：登入 → Set-Cookie: fdgw_session → 後續請求攜帶 Cookie
新：登入 → Response Body { token } → sessionStorage 儲存 → 後續請求帶 Authorization: Bearer <token>
```

#### 後端修改

**`src/routes/auth.ts`** — 登入回應加入 `token` 欄位：
```ts
res.status(200).json({
    ok: true,
    token,           // ← 新增：回傳 token 給前端
    user: { employeeId, name },
});
```

**`src/utils/authGuard.ts`** — 新增讀取 Authorization Header：
```ts
export function getSessionUser(req: Request): SessionUser | null {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        const session = verifySessionToken(authHeader.slice(7));
        if (session) return session;
    }
    // Fallback: cookie（本機開發用）
    const raw = getCookie(req, getSessionCookieName());
    return raw ? verifySessionToken(raw) : null;
}
```

**`src/index.ts`** — CORS 明確允許 Authorization Header：
```ts
cors({
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
})
```

**`src/routes/dashboard.ts`、`src/routes/auth.ts` (GET /auth/me)** — 原本各自複製 Cookie 驗證邏輯，統一改用 `getSessionUser()`。

#### 前端修改

**`src/lib/sessionToken.ts`**（新建）— Token 存取工具：
```ts
export function setSessionToken(token: string): void { ... }
export function getSessionToken(): string { ... }
export function clearSessionToken(): void { ... }
export function authHeaders(): Record<string, string> {
    const token = getSessionToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}
```

**`src/api/authLogin.ts`** — 登入後從 Response Body 取得並儲存 Token：
```ts
const data = await res.json();
if (typeof data.token === "string" && data.token) {
    setSessionToken(data.token);
}
```

**所有 API 函式**（`gameFlow.ts`、`checkinStatus.ts`、`rewardClaimStatus.ts`、`submitCheckin.ts`）— 每個 `fetch` 加入：
```ts
headers: {
    Accept: "application/json",
    ...authHeaders(),   // ← 注入 Authorization: Bearer <token>
}
```

**`src/api/gameFlow.ts` `logoutGame()`** — 登出時清除 Token：
```ts
clearSessionToken();
```

### 5. 附帶修復：dashboard.ts 未走 authGuard

調查過程中發現 `src/routes/dashboard.ts` 有自己的 Cookie 驗證邏輯，未使用 `getSessionUser()`，導致 FinishView 領獎狀態頁 (`GET /me/dashboard`) 在 Bearer Token 情境下回傳 401。統一改用 `getSessionUser()` 後修復。

### 6. 修改的檔案清單

| 檔案 | 類型 | 說明 |
|------|------|------|
| `familyday-backend/src/routes/auth.ts` | 修改 | 登入回傳 `token`；`/auth/me` 改用 `getSessionUser()` |
| `familyday-backend/src/routes/dashboard.ts` | 修改 | 改用 `getSessionUser()` |
| `familyday-backend/src/utils/authGuard.ts` | 修改 | 新增 Bearer Header 驗證 |
| `familyday-backend/src/index.ts` | 修改 | CORS 允許 `Authorization` Header |
| `familyday-frontend/src/lib/sessionToken.ts` | 新建 | Token 存取工具 |
| `familyday-frontend/src/constants/index.ts` | 修改 | 新增 `sessionToken` STORAGE_KEY |
| `familyday-frontend/src/api/authLogin.ts` | 修改 | 儲存登入 token |
| `familyday-frontend/src/api/gameFlow.ts` | 修改 | 所有 fetch 加入 auth header；logout 清除 token |
| `familyday-frontend/src/api/checkinStatus.ts` | 修改 | 加入 auth header |
| `familyday-frontend/src/api/rewardClaimStatus.ts` | 修改 | 加入 auth header |
| `familyday-frontend/src/api/submitCheckin.ts` | 修改 | 加入 auth header |
| `familyday-frontend/src/api/authLogin.test.ts` | 修改 | 更新測試：驗證 token 儲存行為 |

### 7. 資安考量

| 項目 | Cookie（舊） | Bearer Token（新） |
|------|------------|-----------------|
| XSS 風險 | 低（HttpOnly，JS 無法讀取） | 中（sessionStorage 可被 JS 讀取） |
| ITP / 跨域封鎖 | 有（根本問題） | 無（Header 不受 ITP 影響） |
| CSRF 風險 | 需要防範 | 無（Header 不會被瀏覽器自動帶出） |
| Token 有效期 | 無設定（永久有效直到 secret 更換） | 同上（沿用原本 session token 機制） |

本 App 為一日活動、靜態 SPA，無 `v-html` 等 XSS 注入路徑，資安風險在可接受範圍內。

---

## 後續行動項（Action Items）

| 優先度 | 項目 | 說明 |
|--------|------|------|
| 高 | 設定 `FDGW_SESSION_SECRET` 環境變數 | 目前 production 若未設定會 fallback 至 dev key |
| 中 | Session Token 加入過期機制（`exp` 欄位） | 目前 token 永久有效 |
| 中 | 活動後清除 Firestore 測試資料 | 包含 `E2E1001`、seed 帳號的 `player_progress` |
| 低 | 補充後端整合測試 | 目前後端零自動化測試 |

---

## 驗證結果

| 環境 | 修復前 | 修復後 |
|------|--------|--------|
| PC Chrome / Edge | ✅ 正常 | ✅ 正常 |
| iOS Safari（ITP 開啟） | ❌ 401 錯誤 | ✅ 正常 |
| iOS Safari（ITP 關閉） | ✅ 正常（需手動關設定） | ✅ 正常（不需修改設定） |
| iOS Chrome | ❌ 401 錯誤 | ✅ 正常 |
| iOS 無痕模式 | ❌ 401 錯誤 | ✅ 正常 |
