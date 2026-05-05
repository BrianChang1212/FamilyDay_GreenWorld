# 媒體資產索引（Demo + Preview）

本文件整合原 `docs/demo/README.md` 與 `docs/preview/README.md`，集中維護錄影與截圖資產。

---

## 錄影 Demo

- 主示範檔：`docs/demo/family-day-prototype-demo.mp4`
- 根 `README.md` 內嵌播放路徑固定使用上述檔名
- 若檢視器不支援內嵌播放，請改用檔案連結直接開啟

---

## 介面截圖（Preview）

- 截圖位置：`docs/preview/screenshots/`
- 來源：`familyday-frontend/` 執行 `npm run build` 後，以 `vite preview` 輸出的畫面
- 建議 viewport：`390x844`

### 重新產生流程

1. 終端機 A：`cd familyday-frontend` -> `npm run build` -> `npm run preview -- --host 127.0.0.1 --port 4173`
2. 終端機 B（專案根目錄）：`powershell -ExecutionPolicy Bypass -File tool/capture-preview-screenshots.ps1`

---

## 維護原則

- Demo 檔名建議帶日期或版本；大檔可改採雲端連結並在此註記
- README 只保留導覽與連結，媒體規範統一維護在本檔
