import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/WelcomeView.vue";
import BriefingView from "@/views/BriefingView.vue";
import RegisterView from "@/views/RegisterView.vue";
import CheckInFormView from "@/views/CheckInFormView.vue";
import CheckInCompleteView from "@/views/CheckInCompleteView.vue";
import StageView from "@/views/StageView.vue";
import QuizView from "@/views/QuizView.vue";
import ResultView from "@/views/ResultView.vue";
import FinishView from "@/views/FinishView.vue";
import {
	setEntryIntent,
	normalizeQueryEntry,
} from "@/lib/entryIntent";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: "/", name: "welcome", component: WelcomeView },
		{
			path: "/check-in",
			name: "checkinEntry",
			redirect: () => {
				setEntryIntent("checkin");
				return { name: "checkin" };
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
		{ path: "/briefing", name: "briefing", component: BriefingView },
		{ path: "/register", name: "register", component: RegisterView },
		{ path: "/checkin", name: "checkin", component: CheckInFormView },
		{
			path: "/checkin/complete",
			name: "checkinComplete",
			component: CheckInCompleteView,
		},
		{ path: "/stage", name: "stage", component: StageView },
		{ path: "/quiz", name: "quiz", component: QuizView },
		{ path: "/result", name: "result", component: ResultView },
		{ path: "/finish", name: "finish", component: FinishView },
	],
});

router.beforeEach((to) => {
	const q = normalizeQueryEntry(to.query.entry);
	if (q) setEntryIntent(q);
});

export default router;
