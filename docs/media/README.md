# 媒體資產索引（Preview 截圖）

本文件集中維護 **`docs/preview/screenshots/`** 介面截圖與重產流程。舊版 Demo 錄影已自文件與 `docs/demo` 移除；若需新作示範影片，請另存檔後再於此檔或 `docs/overview/root-readme-supplement.md` 補連結。

---

## 介面截圖（Preview）

- 截圖位置：`docs/preview/screenshots/`
- **預設：** 多數為 **`npm run build`** 後 **`vite preview`** 之 **390×844** 全頁截圖：`preview-welcome.png`、`preview-checkin-form.png`、`preview-register.png`、`preview-stage.png`、`preview-finish.png`。其中 **`preview-finish.png`** 對應線上 **`/finish`**（恭喜完成、領獎狀態）；可與自動腳本產生結果一致，或在定稿後以與 **`/finish`** 相同版面之匯出圖覆寫。已廢止獨立 `/finish/claimed`「領取成功」畫面。
- **例外：** 若歡迎頁要保留**手動匯出**之主視覺（非建置畫面），編輯 [`tool/capture-preview-screenshots.ps1`](../../tool/capture-preview-screenshots.ps1) 將 **`$CaptureWelcomeFromApp`** 設為 **`$false`**，執行腳本時會略過重拍 `preview-welcome.png`。

### 重新產生流程

1. 終端機 A：`cd familyday-frontend` -> `npm run build` -> `npm run preview -- --host 127.0.0.1 --port 4173`（若 **4173 已被佔用**，以終端機顯示之 **Local** 埠為準。）
2. 終端機 B（專案根目錄）：若 preview **非 4173**，先設定再跑腳本，例如：  
   `powershell`：`$env:FDGW_PREVIEW_BASE = "http://127.0.0.1:4174"`  
   然後：`powershell -ExecutionPolicy Bypass -File tool/capture-preview-screenshots.ps1`

---

## 維護原則

- 大檔截圖／影片若改放雲端，請在此註記 URL 與版本
- README 只保留導覽與連結，媒體規範統一維護在本檔
