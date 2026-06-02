/**
 * 繁體中文 UI 字串定義
 */

export const zhTW = {
  common: {
    confirm: '確認',
    cancel: '取消',
    next: '下一步',
    back: '回上頁',
    submit: '確定',
    submitting: '送出中…',
    loading: '載入中...',
  },
  welcome: {
    title: '歡迎來到{year}',
    subtitle: '瑞軒家庭日',
    description: '與家人一同走入自然，翻開屬於我們的生活日誌，寫下美好的回憶篇章。',
    startButton: '開始闖關',
    heroAlt:
      "2026 瑞軒科技家庭日活動標誌：視野無界，綠動未來、AmTRAN Go Wild",
    backgroundAlt:
      "叢林冒險主視覺：巨嘴鳥與羊駝穿越熱帶植物與蝶舞光點",
  },
  checkin: {
    tag: '{year} AMTRAN FAMILY DAY',
    title: '歡迎來到瑞軒科技{year}家庭日',
    subtitle: '請輸入以下資料完成報到',
    form: {
      name: '姓名',
      namePlaceholder: '請輸入您的姓名',
      employeeId: '員工編號',
      employeeIdPlaceholder: '例如：1141157',
      companions: '同行人數(不含本人)',
      companionUnit: '人',
      companionUnitZero: '0 人 (沒有攜伴)',
      self: '',
    },
    notice: '資料將用於家庭日當天出席紀錄與人數核對，請確保資訊填寫正確。',
    submitButton: '報到',
    confirmTitle: '請確認以下報到資訊正確',
  },
  checkinComplete: {
    statusTitle: "YOU'RE ALL SET!",
    statusSubtitle: "Family Day Event Registration Complete!",
    viewDetails: "VIEW DETAILS",
    title: "報到成功！",
    subtitle: "感謝參加瑞軒科技{YEAR}家庭日\n準備好跟我們一起在森林中展開冒險了嗎？",
    infoTitle: "報到資訊",
    claimTitle: "領取報到禮",
    claimHint: "請依現場工作人員引導領取{giftLabel}。",
    gameHint: "參加闖關請另掃{qrLabel}，本頁不會進入闖關。",
    giftLabel: "報到禮",
    gameQrLabel: "闖關專用 QR",
    imageAlt: "完成報到：家庭日森林慶祝場景",
    apiLoading: "正在載入報到狀態…",
    apiError: "報到狀態讀取失敗：{error}",
    apiStatus: "後端狀態：{checkedIn}（checkinAt: {checkinAt}）",
    apiCheckedIn: "已報到",
    apiNotCheckedIn: "未報到",
  },
  briefing: {
    title: "遊戲說明",
    mapAlt: "闖關路線示意：START 至 FINISH，沿途六個彩色站點與森林背景",
    mapCaption: "ESTATE EXPLORATION MAP",
    giftsTitle: "闖關拿好禮",
    giftsBullet1: "輸入員工編號並確認姓名，開始你的冒險。",
    giftsBullet2: "完成挑戰就能帶走闖關禮，最多可拿3份喔！",
    locationsTitle: "關卡地點",
    locationsExploreLead: "探索園區內6大關卡：",
    locationsList:
      "天鵝湖、可愛動物區、雨林空中步道、羊駝之家、蝴蝶生態公園、鳥類生態公園",
    locationsAnyOrder: "關卡不限順序，隨時開啟你的探險！",
    startButton: "我知道了",
  },
  register: {
    heroRocketAlt: "闖關登入火箭圖示",
    heroTitle: "完成登入，開始闖關",
    namePlaceholder: "請輸入您的真實姓名",
    employeeIdPlaceholder: "例如：1141157",
    signingIn: "登入中…",
    infoNotice:
      "資料與兌換闖關禮有關，請確保資訊正確。",
    submitButton: "我準備好了",
  },
  scanLogin: {
    title: "登入帳號開始答題",
    submitButton: "確定登入",
  },
  finish: {
    bannerTitle: "Congratulations",
    headline: "恭喜您完成闖關",
    title: "恭喜完成闖關",
    completeMessage:
      "恭喜您完成所有關卡，請至服務台領取闖關禮。",
    statusTitle: "領獎狀態",
    loopHint: "點擊可再次領取，最多 {maxSlots} 份。",
    claimButton: "領取闖關禮",
    claimButtonDone: "闖關禮已領取完畢",
    staffHintClaim: "請交由工作人員點選領取",
    rewardLimitReached:
      "您已達本活動闖關禮領取上限（共 {maxSlots} 次）。仍可繼續體驗闖關或返回首頁。",
    rewardClaimNotEligible:
      "尚無可領取的結算額度（伺服器判定尚未累積新的完整通關禮）。請確認已完成並通關本輪關卡後再試，或請工作人員協助確認紀錄。",
    rewardClaimNotReady: "尚未完成全部關卡，無法領取闖關禮。",
    rewardWaitingBanked:
      "目前尚無新一輪可領取之結算（每領取一次後，須重新完成整輪關卡通關後，伺服器才會再累積下一次）。請離開此頁後回到闖關地圖／掃描站點 QR 繼續作答並通關，完成後再回到本頁；或請現場工作人員協助確認與操作。",
    staffHint: "請由現場工作人員協助點擊「確認領取」。",
    modalStaffInstruction: "請交由工作人員點選操作",
    modalTitle: "確認領取?",
    modalMessage: "您即將領取第 {nextClaimIndex} 次獎品，確認領取後無法取消喔!",
    modalConfirmButton: "確定",
    fallbackName: "{DEFAULT_PLAYER_NAME}",
    imageAlt: "森林慶祝場景：動物們與派對元素，恭喜完成闖關",
    /** 點「領取闖關禮」→ 全屏掃 QR 防誤領（工作人員手持 QR） */
    claimScanAlignTitle: "請對準QRCode",
    claimScanBackButton: "返回",
    claimScanVerifying: "領取中…",
    claimScanVideoAria: "相機取景畫面，請將領獎 QR code 對準方框",
    claimScanQrUnrecognized:
      "QR code 不正確，請確認是否為現場領獎 QR。",
    claimScanCameraDenied:
      "已拒絕相機權限，請在瀏覽器設定允許取用相機後重試。",
    claimScanCameraUnavailable:
      "無法開啟相機，請檢查裝置是否在通話或被其他程式佔用。",
  },
  claimSuccess: {
    bannerTitle: "CELEBRATION TIME!",
    continueButton: "Continue",
    title: "領取成功",
    successMessage: "兌換完成，感謝您參與瑞軒科技{YEAR}家庭日，祝您擁有美好的一天。",
    mockPreviewNote:
      "離線測試：網址參數 mock_claimed 只影響此頁顯示，不代表後端紀錄。",
    localFallbackNote:
      "未設定 VITE_API_BASE：暫以瀏覽器 sessionStorage 類比領獎次數（僅供預覽／原型），上線請改由後端提供。",
    statusTitle: "闖關禮領取狀態",
    rewardLimitReached:
      "您已達本活動闖關禮領取上限（{claimed}／{maxSlots} 次），感謝您的參與。",
    loadingStatus: "載入領獎狀態…",
    retryButton: "重試",
    slotClaimed: "已領取",
    slotPending: "待領取",
    imageAlt: "領取成功：禮物與自然慶祝元素",
  },
  quiz: {
    progressTitle: "闖關進度",
    /** 選擇題頁題卡頂部：第 N 關（中文數字）＋分站名 */
    levelBadge: "第 {ordinal} 關：{stationName}",
    stageAlt: "{stationName} 關卡貼圖",
    loadErrorGeneric: "題目載入失敗，請重試。",
    loadErrorUnauthorized:
      "尚未登入或連線已失效，請返回闖關「登入」頁重新輸入姓名與工號後再試。",
    loadErrorNetwork: "無法連線到伺服器，請確認網路與 API 後重試。",
  },
  result: {
    correctTitle: "恭喜答對",
    wrongTitle: "答錯了",
    correctMessage: "你對大自然的觀察入微，成功解開了這個謎題！",
    wrongMessage: "別灰心，請繼續探索大自然的美好",
    nextButton: "前往下一關 >",
    /** 首次達成 6/6 全破時的按鈕（一行顯示） */
    claimRewardButton: "闖關成功！領取闖關禮",
    /** 已是 6/6 全破狀態下重玩答對時的按鈕 */
    backToStageButton: "回到關卡列表",
    retryButton: "< 重新回答",
  },
  stage: {
    scanAlignTitle: "請對準QRCode",
    scanTitle: "請掃描 QR code",
    scanHint: "將 QR 對準框線以解鎖站點",
    scanVerifying: "驗證中…",
    scanSuccessButton: "模擬掃描成功",
    scanBackButton: "返回",
    prototypeLabel: "The Living Journal · prototype",
    scanAriaLabel: "開啟掃碼",
    unlocked: "任務已解鎖",
    startQuizButton: "開始作答挑戰 →",
    routeTitle:
      "六站進度（按相機掃描該站 QR 進題；順序不拘，此處不支援手動點選切站）",
    /** 6/6 全破時於進度區塊下方的領獎入口按鈕 */
    goClaimRewardButton: "前往領取闖關禮",
    heroBannerAlt:
      "森林探索風格主視覺：放大鏡、相機、寶箱、地圖與林間小徑",
    heroTitle: "一起完成挑戰吧！",
    heroSubtitle:
      "請點選相機並掃描各關現場 QR code，將直接進入該關選擇題；完成後回到本頁更新進度。下方列表僅顯示狀態，無法手動選站。",
    statusCompleted: "已完成",
    /** 列表「未完成」狀態（僅展示，解鎖靠掃 QR） */
    statusLocked: "待解鎖",
    scanVideoAria: "相機取景畫面，請將 QR code 對準方框",
    scanQrMismatch:
      "此 QR 與站台驗證不符，請確認掃描的是正確關卡之現場 QR。",
    scanQrUnrecognized:
      "無法從 QR 辨識關卡編號，請確認掃描的是活動關卡通行碼。",
    scanVerifyFailed: "站點驗證失敗，請重新對準 QR code。",
    qrImageAlt: "掃描 QR code：扁平自然風取景框、中央條碼與掃描線示意",
    stageImageAlt: "{stationName} 關卡貼圖",
  },
  header: {
    title: "{YEAR} 瑞軒家庭日",
    subtitle: "AMTRAN FAMILY DAY",
    progressLabel: "闖關進度",
  },
  footer: {
    copyright: "© {year} AmTRAN Technology Co., Ltd.",
    poweredBy: "Powered by AmTRAN Technology Co., Ltd.",
    linksAriaLabel: "Footer links",
    linkSafety: "安全說明",
    linkPrivacy: "隱私權",
    linkContact: "聯絡資訊",
  },
};

export type MessageSchema = typeof zhTW;
