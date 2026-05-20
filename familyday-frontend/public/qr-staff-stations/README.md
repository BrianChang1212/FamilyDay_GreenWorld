# 工作人員手持 QR（領獎驗證）

| 檔案 | 用途 | 編碼 payload |
|------|------|----------------|
| `claim-token.png` | **領獎防誤領**：玩家於 FinishView 點「領取闖關禮」後進掃 QR 全屏，掃到此 QR 才會呼叫 `/api/v1/me/reward/claim`，避免無人監督時連按上限。 | `fdgw-claim-token` |

**現場注意：**
- 此 QR **不應**展示給玩家自行拍照；應由工作人員短暫亮出供玩家掃。
- 掃描次數 = 領取次數；最多 3 次由後端 `maxRounds=3` 把關。
- 解析邏輯：`familyday-frontend/src/lib/claimPayload.ts::isClaimToken`。
- 重新產生：`cd familyday-frontend && npm run qr:claim`。

**安全性說明：** 固定字串 token 適用一日活動規模（人員監督 + 後端領取上限）。
若日後活動規模擴大或需離場後仍可運作，可升級為 JWT 簽章 + 後端驗證（會涉及
`/api/v1/me/reward/claim` 契約變更）。
