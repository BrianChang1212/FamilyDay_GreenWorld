# 監控與預算告警 Runbook(familyday-greenworld)

> **建立日期:** 2026-05-29
> **完成日期:** 2026-05-29(全 5 條告警已設定並驗證 ✓)
> **GCP 專案:** `familyday-greenworld`
> **告警通知 email:** `familyday.amtran@gmail.com`(單一收件人)
> **實際設定工時:** ~30 min(Console 點選 + email 驗證)

## 目的

給正式環境裝**兩條保險絲**——出事自動 email 通知,不必手動巡邏:

1. **預算告警**:GCP 帳單超過設定金額 → email
2. **健康監控**:API/Hosting 失敗或變慢 → email

## 告警清單(設好後該有的狀態)

| # | 類型 | 觸發條件 | 通知 | 一次性?活動切換? |
|---|------|----------|------|----------------------|
| 1 | Budget | 月支出達 **$50** | email | 一次性 |
| 2 | Uptime — Hosting | `https://familyday-greenworld.web.app/` 連續失敗 2 次 | email | 一次性 |
| 3 | Uptime — API | `https://api-jwvq2npioq-uc.a.run.app/api/v1/health` 連續失敗 2 次 | email | 一次性 |
| 4 | Cloud Run — failure rate | `api` 5xx 比率 > **1%** 持續 5 min | email | 一次性 |
| 5 | Cloud Run — p95 latency | `api` 請求 p95 > **2 s** 持續 5 min | email | 一次性 |

---

## Step 1 — 建立 Email 通知通道(一次性,~3 min)

1. 開啟 [Cloud Monitoring → Notification channels](https://console.cloud.google.com/monitoring/alerting/notifications?project=familyday-greenworld)
2. 點 **Add new** → 選 **Email**
3. 填:
   - **Email Address:** `familyday.amtran@gmail.com`
   - **Display Name:** `familyday-amtran-primary`
4. 按 **Save**
5. **檢查信箱** → 收到 GCP 寄來的「Verify your notification channel」→ 點連結驗證
6. 回 Console,該通道狀態應變為 **Verified**(綠勾)

✅ **驗證點:** Notification channels 列表中看到該 email,狀態 `Verified`。

---

## Step 2 — 預算告警(一次性,~5 min)

1. 開啟 [Billing → Budgets & alerts](https://console.cloud.google.com/billing/budgets?project=familyday-greenworld)
2. 點 **Create Budget**
3. **Scope** 區:
   - **Name:** `familyday-greenworld-monthly`
   - **Projects:** 勾選 `familyday-greenworld`(只看這專案,不包含其他)
   - **Services:** 留空(全部 service)
4. **Amount** 區:
   - **Budget type:** Specified amount
   - **Target amount:** **50** USD(一次性設定,涵蓋常態 + 活動月)
5. **Actions** 區:
   - **Threshold rules** 設三段:
     - 50% — Trigger on `Actual` — Notify
     - 90% — Trigger on `Actual` — Notify
     - 100% — Trigger on `Actual` + `Forecasted` — Notify
   - **Notifications:**
     - ✅ **Email alerts to billing admins and users**(預設保留)
     - ✅ 勾 **Connect a Cloud Monitoring email notification channel** → 選 `familyday-amtran-primary`
6. 按 **Finish**

✅ **驗證點:** Budget 列表中看到 `familyday-greenworld-monthly`,狀態 `Enabled`。

### 金額調整(若未來想更嚴格)
若 idle 月實際成本驗證為 ~$1 以下,可調整目標金額至 **$10–$20**,讓 50% threshold($5–$10)更早抓到異常。目前 **$50** 設定的優點:覆蓋活動月,不用每月切換、零維護。

---

## Step 3 — Uptime Checks(2 條,各 ~4 min)

### 3a. Hosting Uptime

1. 開啟 [Monitoring → Uptime checks](https://console.cloud.google.com/monitoring/uptime?project=familyday-greenworld)
2. 點 **Create Uptime Check**
3. **Target** 區:
   - **Protocol:** HTTPS
   - **Resource Type:** URL
   - **Hostname:** `familyday-greenworld.web.app`
   - **Path:** `/`
   - **Check frequency:** 15 minutes
   - **Regions:** 勾「全球」(共 6 個區域:亞太、歐洲、南美、美國 3 區)
4. **Response Validation** 區:
   - **Response Codes:** 200
5. **Alert & Notification** 區:
   - **Name:** `prod-hosting-uptime`
   - **Duration:** 5 min(連續失敗 5 分鐘才告警,避免單次抖動)
   - **Notification channels:** 加入 `familyday-amtran-primary`
6. 按 **Create**

### 3b. API Health Uptime

同 3a,但:
- **Hostname:** `api-jwvq2npioq-uc.a.run.app`
- **Path:** `/api/v1/health`
- **Name:** `prod-api-health-uptime`
- 其餘相同

✅ **驗證點:** Uptime checks 頁面看到 2 條,5 分鐘內顯示 `Passing`(綠勾)。

---

## Step 4 — Cloud Run Alert Policies(2 條,各 ~4 min)

### 4a. API Failure Rate > 1%

1. 開啟 [Monitoring → Alerting → Policies](https://console.cloud.google.com/monitoring/alerting/policies?project=familyday-greenworld) → **Create Policy**
2. **Select a metric:**
   - **Resource:** Cloud Run Revision
   - **Metric:** `Request count` (filter category: Cloud Run Revision → Request_count)
   - **Filter:** `service_name = api`(注意:不是 apiLoadtest)
   - **Group by:** `response_code_class`
3. **Configure trigger:**
   - **Threshold type:** Above
   - **Threshold value:** ※ 此 metric 是 count,要用 ratio aggregation → 改用 **Log-based metric** 或在 alert query 用 MQL/PromQL ratio
   - **簡化作法:** 用內建 `service/request_count` + filter `response_code_class = "5xx"`,門檻 **5xx 請求數 / 5 min > 10**(估算 200 RPS × 5 min × 1% = 60 個 5xx 即超標,設 10 算保守)
4. **Notifications:** `familyday-amtran-primary`
5. **Name:** `prod-api-failure-rate`
6. **Documentation(告警 email 內文)**:
   ```
   正式 api Cloud Run 服務 5xx 錯誤異常上升。
   立刻查 Cloud Logging:
   https://console.cloud.google.com/logs/query?project=familyday-greenworld
   過濾 resource.type="cloud_run_revision" AND severity>=ERROR
   ```
7. **Save**

### 4b. API p95 Latency > 2 s

1. **Create Policy** → 同 4a 路徑
2. **Select a metric:**
   - **Resource:** Cloud Run Revision
   - **Metric:** `Request latencies`
   - **Filter:** `service_name = api`
   - **Aggregation:** 95th percentile
3. **Configure trigger:**
   - **Threshold type:** Above
   - **Threshold value:** **2000** ms
   - **Duration:** 5 min
4. **Notifications:** `familyday-amtran-primary`
5. **Name:** `prod-api-p95-latency`
6. **Documentation:**
   ```
   正式 api 回應時間 p95 > 2 秒 持續 5 分鐘。
   可能原因:Firestore contention、cold start 堆積、外部依賴變慢。
   查指標:
   https://console.cloud.google.com/run/detail/us-central1/api/metrics?project=familyday-greenworld
   ```
7. **Save**

✅ **驗證點:** Alerting → Policies 看到 5 條(2 條 uptime 自動產生 + 上面 2 條 + 之後加的),全部狀態 `Active`、`No incidents`。

---

## Step 5 — 驗證告警 email 真的會收到

### 實際採用的方法:Channel verification 就是 end-to-end 證明

GCP 在 Step 1 建立 Email notification channel 時會**自動寄一封驗證信**到該信箱。**只要你收到並點了驗證連結**,就代表:

1. ✅ GCP 能成功寄信到 `familyday.amtran@gmail.com`
2. ✅ Gmail 沒擋 GCP 寄件人
3. ✅ Channel 狀態 `Verified`

→ 這已經是 end-to-end 證明 email 通道暢通,**不需要另外做 test notification**。

(註:GCP Console 的 Edit Email Channel dialog 並未開放獨立的 `Send test notification` 按鈕,只能改 email/名稱;Step 1 的驗證信即為實質的測試。)

### Alert policy → Channel 的綁定驗證(視覺檢查)

| 檢查項 | 方法 | 預期 |
|--------|------|------|
| Budget 綁定 channel | Billing → Budgets → 編輯 `familyday-greenworld-monthly` | 「監控電子郵件通知管道」已勾、選 `familyday-amtran-primary` ✓ |
| Uptime checks 綁定 channel | Monitoring → Uptime checks → 點該條 → 看 Alert | Notification channels 列表中有 `familyday-amtran-primary` ✓ |
| Alert policies 綁定 channel | Monitoring → Alerting → Policies → 點該條 | Notification channels 列表中有 `familyday-amtran-primary` ✓ |

### 若日後想模擬一次真實告警(可選)

如果想看到實際的告警 email 長怎樣:
1. 編輯 `prod-api-p95-latency` alert
2. 暫時把 Threshold 從 `2000` 改成 `1`(ms)→ Save
3. 等 ~5–10 min,正式 API 一定 p95 > 1 ms → 告警觸發、email 進信
4. 編輯 alert,Threshold 改回 `2000`
5. 等 30 min,incident 自動 resolved + 收到「resolved」信(因 Step 4b 勾了 `Notify on incident closure`)

---

## Step 6 — 活動結束後的清理(活動日次日)

| 項目 | 動作 |
|------|------|
| 預算 | 改回 $10 |
| Alert policies | **暫不關閉**——idle 沒費用,留著保險(若 Firestore 寫法異常仍能監控) |
| Uptime checks | 改頻率為 30 min(降低監控成本到極低)|
| Notification channel | 保留 |

---

## Troubleshooting

| 症狀 | 原因 / 處置 |
|------|-------------|
| 設好但收不到 test notification | 1. 進 Spam 資料夾找;2. 確認 channel 狀態 `Verified`(未驗證的 channel 不會發信);3. 用瀏覽器另一個 tab 開 `familyday.amtran@gmail.com` 確認沒被 Google 擋下 |
| Budget 預算告警 email 慢半天才到 | 正常——GCP Budget 是約 **24 小時**才能反映費用,**這是設計上的延遲、無法縮短**。所以 budget 主要防「失控帳單」,不是即時防火牆。 |
| Uptime check 一直 `Failing` 但網站明明正常 | 1. 看 Selected regions 是否選太少;2. SSL/TLS 是否被偵測為不合規;3. 在 Uptime details 頁看每個 region 的 response code 細節 |
| Cloud Run alert 一直觸發(false positive) | 1. 看 metric 圖,確認門檻值合理;2. p95 短期內常因 cold start 升高,duration 從 5 min 拉長到 10 min |

---

## 預估費用

| 項目 | 月費 |
|------|------|
| Notification channel(email)| **免費** |
| Budget alert | **免費** |
| Uptime checks(2 條 × 5 min × 3 regions)| **免費**(每月 100 萬次免費額度,本設定遠低於) |
| Alert policies(2 條)| **免費**(警報本身免費,只有警報背後的 Cloud Logging 寫入若超量會收費) |
| **本 runbook 設定總成本** | **$0 USD/月** |

---

## 相關文件

- 正式環境總覽:[`README.md` § 即時進度](../../README.md#readme-live-progress)
- 部署架構:[`docs/architecture/summary-deployment.md`](../architecture/summary-deployment.md)
- 活動日 runbook(報到/闖關/領獎流程):[`README.md`](../../README.md) 操作方式
