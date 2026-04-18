import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { FINISH_REWARD_SLOTS } from "@/lib/constants/finishReward";
import { getFinishClaimedCount } from "@/lib/demoState";
import {
	parseMockClaimedQueryParam,
	resolveRewardClaimPresentation,
	type RewardClaimStatusSource,
	type RewardClaimPresentationResult,
} from "@/lib/rewardClaimPresentation";
import { getViteApiBase } from "@/lib/apiBase";

function applyPresentationResult(
	r: RewardClaimPresentationResult,
	claimed: { value: number },
	maxSlots: { value: number },
	statusSource: { value: RewardClaimStatusSource },
	statusLoadState: { value: "loading" | "ok" | "error" },
	statusError: { value: string },
): void {
	if (r.loadState === "error") {
		statusSource.value = r.statusSource;
		statusLoadState.value = "error";
		statusError.value = r.error;
		return;
	}
	claimed.value = r.claimed;
	maxSlots.value = r.maxSlots;
	statusSource.value = r.statusSource;
	statusLoadState.value = "ok";
	statusError.value = "";
}

export function useRewardClaimPresentation() {
	const route = useRoute();

	const claimed = ref(0);
	const maxSlots = ref(FINISH_REWARD_SLOTS);
	const statusSource = ref<RewardClaimStatusSource>("api");
	const statusLoadState = ref<"loading" | "ok" | "error">("loading");
	const statusError = ref("");

	function mockFromRoute(): number | null {
		return parseMockClaimedQueryParam(
			route.query.mock_claimed,
			FINISH_REWARD_SLOTS,
		);
	}

	const isMockPreview = computed(() => mockFromRoute() !== null);

	async function loadClaimPresentation(): Promise<void> {
		const mock = mockFromRoute();
		if (mock === null && getViteApiBase()) {
			statusLoadState.value = "loading";
			statusError.value = "";
		}

		const result = await resolveRewardClaimPresentation(
			mock,
			getFinishClaimedCount,
		);

		applyPresentationResult(
			result,
			claimed,
			maxSlots,
			statusSource,
			statusLoadState,
			statusError,
		);
	}

	watch(
		() => route.query.mock_claimed,
		() => {
			void loadClaimPresentation();
		},
	);

	return {
		claimed,
		maxSlots,
		statusSource,
		statusLoadState,
		statusError,
		isMockPreview,
		loadClaimPresentation,
	};
}
