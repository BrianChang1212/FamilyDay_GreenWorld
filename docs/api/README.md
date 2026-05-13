# REST API v0.1（文件索引與發佈約定）

本目錄為 **REST v0.1** **正文** [`api-v0.1.md`](./api-v0.1.md) 與 **契約變更紀錄** [`CHANGELOG.md`](./CHANGELOG.md) 之**單一維護區**（與 `docs/` 內其餘規格／架構文件一併管理）。

| 項目 | 說明 |
|------|------|
| **現況（修訂）** | 正文修訂 **v0.1.26**（2026-05-13）：SPA **`Bearer`** + 登入 **`ok`**／**`token`**／**`user`**；詳見 [`api-v0.1.md`](./api-v0.1.md) 檔首長註與文末修訂表 |
| **契約正文** | [`api-v0.1.md`](./api-v0.1.md) |
| **變更紀錄（Keep-a-changelog 風格）** | [`CHANGELOG.md`](./CHANGELOG.md) |
| **程式碼審查指派** | 倉庫根 **[`.github/CODEOWNERS`](../../.github/CODEOWNERS)**（覆寫 **`docs/api/api-v0.1.md`**、**`docs/api/CHANGELOG.md`**） |
| **CI 驗證** | 根 **[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)**：`docs/api` 檔存在性 |

---

## 版本標籤

- Tag 格式：`contract-vMAJOR.MINOR.PATCH`
- Breaking request／response：**MAJOR** bump
- 向後相容擴充：**MINOR**
- 純文字／typo：**PATCH**

## 發佈流程（單 mono-repo）

1. 編輯 **`docs/api/api-v0.1.md`**／**`docs/api/CHANGELOG.md`**。
2. 開 PR（前後端皆應可被 review）。
3. Merge 後於此倉庫打 **`contract-v*`** Git tag。

（歷史上曾存在 **`familyday-api-contract/`** 資料夾以承載對外敘述；**已移除**——契約一律在此 **`docs/api/`**。）
