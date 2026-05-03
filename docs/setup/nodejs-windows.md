# Windows：安裝 Node.js 與 npm（疑難排解）

若 PowerShell 出現 **npm** 無法辨識，代表尚未安裝 Node.js，或 PATH 尚未載入。

## 1. 以 winget 安裝（建議：無系統管理員權限時用「使用者範圍」）

全系統安裝（預設）在**非系統管理員**環境可能失敗（MSI **Error 1925**／結束代碼 **1603**：權限不足）。可改為只安裝給目前使用者：

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --disable-interactivity --scope user
```

成功時 winget 會提示已新增 `node` 指令，並可能提示**需重新開啟終端機**才會套用 PATH。

## 2. 同一個終端機內立即套用 PATH（不必重開 Cursor 時可先執行）

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
node -v
npm -v
```

## 3. 全系統安裝（選用）

若要以**系統管理員**安裝給所有使用者：以系統管理員開啟 PowerShell，執行 `winget install OpenJS.NodeJS.LTS ...`（**不要**加 `--scope user`），並依 UAC 提示同意。

## 4. 安裝失敗時的記錄檔（winget／MSI）

路徑範例（實際檔名含時間戳記）：

`%LOCALAPPDATA%\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\LocalState\DiagOutputDir\`

內可搜尋 **Error 1925**、**1603** 對照權限或舊版衝突。

專案需求：**Node.js 20 LTS** 以上（見根目錄 [`README.md`](../../README.md)）。
