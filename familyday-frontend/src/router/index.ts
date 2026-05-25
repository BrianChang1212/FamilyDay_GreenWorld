import { nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/home/WelcomeView.vue";
import BriefingView from "@/views/onboarding/BriefingView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import CheckInFormView from "@/views/checkin/CheckInFormView.vue";
import CheckInWelcomeView from "@/views/checkin/CheckInWelcomeView.vue";
import CheckInCompleteView from "@/views/checkin/CheckInCompleteView.vue";
import StageView from "@/views/quest/StageView.vue";
import QuizView from "@/views/quest/QuizView.vue";
import ResultView from "@/views/quest/ResultView.vue";
import FinishView from "@/views/quest/FinishView.vue";
import {
	clearCheckinWelcomePassed,
	isCheckinWelcomePassed,
	normalizeQueryEntry,
	setEntryIntent,
} from "@/lib/entryIntent";
import {
	clearPendingFinish,
	clearPendingStationVerification,
	setInZone,
	setPendingFinish,
	setPendingStationVerification,
	setStage,
} from "@/lib/demoState";
import { resolveScanIntent } from "@/lib/scanEntry";
import { getSessionToken } from "@/lib/sessionToken";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "welcome",
			component: WelcomeView,
		},
		{
			path: "/check-in",
			name: "checkinEntry",
			redirect: () => {
				setEntryIntent("checkin");
				clearCheckinWelcomePassed();
				return { name: "checkinWelcome" };
			},
		},
		{
			path: "/game",
			name: "gameEntry",
			redirect: () => {
				setEntryIntent("game");
				return { name: "welcome" };
			},
		},
		/*
		 * 外部相機／QR scanner 進入點：QR PNG 編碼為
		 *   https://<host>/scan?t=<JWT>
		 * 命中本路由 → 解析 stage → 一律導到對應題目頁面 /quiz?challengeId=...。
		 * 未登入時 QuizView mount 偵測無 session + 有 pendingStation → 跳
		 * StageScanLoginModal 在前景強制登入；登入成功 modal 關閉、QuizView
		 * 自然 fetch 題目。pendingStationVerification 在進站時寫入，登入後
		 * 由 QuizView 直接讀 query / lib 還原即可。
		 */
		{
			path: "/scan",
			name: "scan",
			redirect: (to) => {
				const intent = resolveScanIntent(to.query);
				if (intent.type === "invalid") {
					return { name: "stage" };
				}
				setEntryIntent("game");
				setStage(intent.stageId);
				setInZone(true);
				setPendingStationVerification(
					intent.stageId,
					intent.challengeId,
				);
				clearPendingFinish();
				return {
					name: "quiz",
					query: { challengeId: intent.challengeId },
				};
			},
		},
		/*
		 * 領獎入口 QR：PNG 編碼為 `https://<host>/reward`。
		 * 已登入直接到 /finish；未登入導 /register，RegisterView 登入完成讀
		 * pendingFinish 旗標跳回 /finish。
		 */
		{
			path: "/reward",
			name: "rewardEntry",
			redirect: () => {
				setEntryIntent("game");
				setPendingFinish(true);
				clearPendingStationVerification();
				if (getSessionToken()) {
					return { name: "finish" };
				}
				return { name: "register" };
			},
		},
		{ path: "/briefing", name: "briefing", component: BriefingView },
		{ path: "/register", name: "register", component: RegisterView },
		/*
		 * 報到路徑：
		 *   /checkin          → 歡迎畫面 (checkinWelcome)
		 *   /checkin/register → 填報到資料表單 (checkin)   ← 需先過歡迎頁才可進入
		 *   /checkin/complete → 報到完成
		 * 較長路徑列在 /checkin 之前，避免前綴誤匹配
		 */
		{
			path: "/checkin/register",
			name: "checkin",
			component: CheckInFormView,
			beforeEnter(to, _from, next) {
				if (isCheckinWelcomePassed()) {
					next();
					return;
				}
				next({
					name: "checkinWelcome",
					replace: true,
					query: to.query,
					hash: to.hash,
				});
			},
		},
		{
			path: "/checkin/complete",
			name: "checkinComplete",
			component: CheckInCompleteView,
		},
		{
			path: "/checkin",
			name: "checkinWelcome",
			component: CheckInWelcomeView,
		},
		{ path: "/stage", name: "stage", component: StageView },
		{ path: "/quiz", name: "quiz", component: QuizView },
		{ path: "/result", name: "result", component: ResultView },
		{ path: "/finish", name: "finish", component: FinishView },
		/* Legacy URL: 領獎狀態已合併於 FinishView */
		{
			path: "/finish/claimed",
			redirect: { name: "finish" },
		},
	],
});

router.beforeEach((to) => {
	const q = normalizeQueryEntry(to.query.entry);
	if (q) setEntryIntent(q);
});

/* 換頁後單次 nextTick 歸零捲動；勿加 rAF/setTimeout（易與舊版 Transition 衝突）。 */
router.afterEach(() => {
	nextTick(() => {
		const el = document.querySelector<HTMLElement>(".gw-scroll");
		if (el) el.scrollTop = 0;
	});
});

export default router;
