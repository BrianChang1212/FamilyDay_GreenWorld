<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import GwBrandBar from "@/components/GwBrandBar.vue";
import {
	clearPendingStationVerification,
	getCompletedStageIds,
	setInZone,
} from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";
import { GAME_CONFIG } from "@/constants";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const currentChallengeId = computed(() => {
	const v = route.query.challengeId;
	return typeof v === "string" ? v : "";
});
const ok = computed(() => route.query.ok === "1");

function next() {
	if (!ok.value) {
		router.push({
			name: "quiz",
			query: currentChallengeId.value
				? { challengeId: currentChallengeId.value }
				: undefined,
		});
		return;
	}
	if (getCompletedStageIds().length >= GAME_CONFIG.TOTAL_STAGES) {
		router.push({ name: "finish" });
		return;
	}
	setInZone(false);
	clearPendingStationVerification();
	router.push({ name: "stage" });
}
</script>

<template>
	<div
		class="relative flex min-h-full flex-col bg-[#eef0eb] bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(47,115,84,0.08),transparent_50%)]"
	>
		<GwBrandBar />

		<main
			class="relative z-[2] flex flex-1 flex-col items-center px-5 pb-10 pt-6 sm:mx-auto sm:w-full sm:max-w-md"
		>
			<div class="relative flex w-full flex-col items-center">
				<!-- 成功頁：葉／星裝飾（放大） -->
				<div
					v-if="ok"
					class="pointer-events-none absolute left-[2%] top-[14%] text-4xl text-[#2f7354]/75 sm:left-[6%] sm:text-5xl"
					aria-hidden="true"
				>
					🍃
				</div>
				<div
					v-if="ok"
					class="pointer-events-none absolute right-[4%] top-[10%] text-3xl text-amber-400/95 sm:right-[8%] sm:text-4xl"
					aria-hidden="true"
				>
					✦
				</div>

				<div
					class="result-icon-wrap relative flex h-[11rem] w-[11rem] shrink-0 items-center justify-center sm:h-[12rem] sm:w-[12rem]"
					aria-hidden="true"
				>
					<div
						:class="[
							'absolute inset-0 rounded-full',
							ok
								? 'bg-gw-mint/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
								: 'bg-rose-100/95 shadow-[0_0_56px_rgba(251,113,133,0.5)]',
						]"
					/>
					<div
						:class="[
							'relative flex h-[7rem] w-[7rem] items-center justify-center rounded-full shadow-lg sm:h-[7.75rem] sm:w-[7.75rem]',
							ok
								? 'bg-[#22c55e] text-white shadow-gw-soft ring-[3px] ring-white/55'
								: 'bg-[#b4232c] text-white shadow-[0_12px_28px_rgba(180,35,44,0.35)] ring-[3px] ring-white/35',
						]"
					>
						<svg
							v-if="ok"
							class="h-12 w-12 translate-y-px sm:h-14 sm:w-14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 13l5 5L20 7" />
						</svg>
						<svg
							v-else
							class="h-11 w-11 sm:h-12 sm:w-12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
						>
							<path d="M7 7l10 10M17 7L7 17" />
						</svg>
					</div>
				</div>

				<h1
					:class="[
						'mt-10 max-w-[22rem] text-center font-display text-[1.75rem] font-bold leading-snug tracking-tight text-balance sm:text-[2rem]',
						ok ? 'text-[#2f7354]' : 'text-[#b4232c]',
					]"
				>
					{{ ok ? t("result.correctTitle") : t("result.wrongTitle") }}
				</h1>

				<p
					class="mt-5 max-w-[24rem] text-center text-base leading-relaxed text-neutral-600 sm:text-lg"
				>
					{{
						ok
							? t("result.correctMessage")
							: t("result.wrongMessage")
					}}
				</p>
			</div>

			<div class="mt-12 flex w-full max-w-md flex-col gap-5">
				<button
					type="button"
					class="w-full rounded-2xl bg-[#2f7354] py-[1.05rem] text-lg font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] sm:py-5"
					@click="next"
				>
					{{ ok ? t("result.nextButton") : t("result.retryButton") }}
				</button>
				<button
					type="button"
					class="w-full py-2 text-center text-base font-semibold text-[#2f7354] underline decoration-[#2f7354]/40 underline-offset-4 transition hover:text-[#1f5a40]"
					@click="router.push({ name: 'stage' })"
				>
					{{ t("result.backMapButton") }}
				</button>
			</div>
		</main>
	</div>
</template>

<style scoped>
@keyframes result-icon-in {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.result-icon-wrap {
	animation: result-icon-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
</style>
