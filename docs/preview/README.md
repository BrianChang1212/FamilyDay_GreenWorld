# 預覽畫面截圖（`screenshots/`）

`screenshots/*.png` 為本倉庫 **`source/`** 執行 **`npm run build`** 後，以 **`vite preview`**（預設 **http://127.0.0.1:4173**）擷取之靜態畫面；viewport **390×844**（手機比例），與根 [`README.md`](../../README.md)「**介面預覽（截圖）**」一節併陳。

## 重新產生

1. 終端機 A：`cd source` → `npm run build` → `npm run preview -- --host 127.0.0.1 --port 4173`
2. 終端機 B：在倉庫根目錄執行  
   `powershell -ExecutionPolicy Bypass -File tool/capture-preview-screenshots.ps1`

需已安裝 Node.js；首次執行會由 `npx` 下載 Playwright 所需瀏覽器。腳本會產生 **`/`**、**`/checkin`**、**`/register`**、**`/stage`**、**`/finish/claimed`** 五張 PNG（與根 README 嵌入之檔名一致）。
