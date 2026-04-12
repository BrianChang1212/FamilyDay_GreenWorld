import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/WelcomeView.vue";
import BriefingView from "@/views/BriefingView.vue";
import RegisterView from "@/views/RegisterView.vue";
import StageView from "@/views/StageView.vue";
import QuizView from "@/views/QuizView.vue";
import ResultView from "@/views/ResultView.vue";
import FinishView from "@/views/FinishView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: "/", name: "welcome", component: WelcomeView },
		{ path: "/briefing", name: "briefing", component: BriefingView },
		{ path: "/register", name: "register", component: RegisterView },
		{ path: "/stage", name: "stage", component: StageView },
		{ path: "/quiz", name: "quiz", component: QuizView },
		{ path: "/result", name: "result", component: ResultView },
		{ path: "/finish", name: "finish", component: FinishView },
	],
});

export default router;
