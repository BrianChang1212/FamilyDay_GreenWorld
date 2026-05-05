# Mock API 驗證流程

> 目的：後端尚未完整上線前，先驗證前端串接、錯誤處理與畫面呈現。  
> 主清單請見：[`api-integration-checklist.md`](./api-integration-checklist.md)。

## 1) 啟動

在 `source/`：

```bash
npm run mock:api
```

預設埠號：`8787`  
自訂埠號：

```powershell
$env:MOCK_API_PORT=9000
npm run mock:api
```

## 2) 前端改接 Mock API

`source/.env.local`：

```env
VITE_API_BASE=http://localhost:8787
```

變更後請重啟：

```bash
npm run dev
```

## 3) `/finish/claimed` 快速案例

| 案例 | 請求範例 | 預期 |
|------|----------|------|
| ok | `/api/v1/me/dashboard` | 顯示預設進度 |
| missing | `/api/v1/me/dashboard?scenario=missing` | 使用預設值，不崩潰 |
| invalid | `/api/v1/me/dashboard?scenario=invalid` | 前端 clamp |
| full | `/api/v1/me/dashboard?scenario=full` | 顯示全領取 |
| empty | `/api/v1/me/dashboard?scenario=empty` | 顯示 0 |
| error | `/api/v1/me/dashboard?scenario=error` | 顯示錯誤或降級 |

手動測 API：

```bash
curl "http://localhost:8787/api/v1/me/dashboard?scenario=ok"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=missing"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=invalid"
curl "http://localhost:8787/api/v1/me/dashboard?scenario=error"
```

## 4) 一鍵測試

全站 smoke：

```bash
npm run test:api:all
```

闖關專項：

```bash
npm run test:api:game
```

對應實作：
- Mock Server：`source/mock/server.js`
- 全站測試：`source/mock/test-all-api.js`
- 闖關測試：`source/mock/test-game-api.js`
