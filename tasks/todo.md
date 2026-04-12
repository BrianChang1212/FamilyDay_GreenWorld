# FamilyDay_GreenWorld — 路由過場動態

## 計畫

- [x] 在 `App.vue` 以 `<Transition mode="out-in">` 包住 `RouterView` 動態元件，並以 `route.fullPath` 作 key
- [x] 在 `style.css` 新增 `.gw-route-*` 過場（僅 `opacity`、`transform`），並處理 `prefers-reduced-motion`
- [x] 執行 `npm run build` 與 `npm run dev` 確認無錯誤

## 檢視

- **建置**：`npm run build`（含 `vue-tsc -b`）成功結束。
- **開發伺服器**：`npm run dev -- --host 127.0.0.1 --port 5174` 啟動正常；對 `http://127.0.0.1:5174/` 發出 GET 回傳 **200**。
- **手動視覺確認**：於瀏覽器開啟上述網址，點「下一步」或導向其他路由，應看到約 220ms 的淡出／淡入與輕微 `translateY(6px)`；系統開啟「減少動態效果」時過場應近乎瞬間。
