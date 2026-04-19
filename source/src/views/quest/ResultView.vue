<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { advanceStage, getStage } from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";
import { GAME_CONFIG } from "@/constants";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const stage = ref(1);

const ok = computed(() => route.query.ok === "1");

onMounted(() => {
	stage.value = getStage();
});

function next() {
	if (!ok.value) {
		router.push({ name: "quiz" });
		return;
	}
	if (stage.value >= GAME_CONFIG.TOTAL_STAGES) {
		router.push({ name: "finish" });
		return;
	}
	advanceStage();
	router.push({ name: "stage" });
}
</script>

<template>
	<div
		class="relative flex min-h-full flex-col bg-gw-cream bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(26,157,74,0.06),transparent_50%)]"
	>
		<AppHeader class="relative z-[2]" :stage="stage" show-progress show-user />

		<main
			class="relative z-[2] flex flex-1 flex-col items-center px-5 pb-8 pt-6 sm:mx-auto sm:max-w-md sm:w-full"
		>
			<!-- 純 CSS／SVG 雙層圓形狀態圖示（無圖檔） -->
			<div
				class="result-icon-wrap relative flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center"
				aria-hidden="true"
			>
				<div
					:class="[
						'absolute inset-0 rounded-full',
						ok ? 'bg-gw-mint/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]' : 'bg-rose-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
					]"
				/>
				<div
					:class="[
						'relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full shadow-lg',
						ok
							? 'bg-gw-forest text-white shadow-gw-soft ring-2 ring-white/35'
							: 'bg-[#b4232c] text-white shadow-[0_12px_28px_rgba(180,35,44,0.35)] ring-2 ring-white/30',
					]"
				>
					<svg
						v-if="ok"
						class="h-9 w-9 translate-y-px"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 13l5 5L20 7" />
					</svg>
					<svg
						v-else
						class="h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.6"
						stroke-linecap="round"
					>
						<path d="M7 7l10 10M17 7L7 17" />
					</svg>
				</div>
			</div>

			<h1
				:class="[
					'mt-9 text-center font-display text-2xl font-bold tracking-tight sm:text-[1.65rem]',
					ok ? 'text-gw-forest' : 'text-[#b4232c]',
				]"
			>
				{{ ok ? t("result.correctTitle") : t("result.wrongTitle") }}
			</h1>

			<p
				class="mt-4 max-w-[20rem] text-center text-[0.95rem] leading-relaxed text-gw-navy/88"
			>
				{{
					ok
						? t("result.correctMessage")
						: t("result.wrongMessage")
				}}
			</p>

			<div class="mt-auto flex w-full max-w-md flex-col gap-3 pt-12">
				<button
					type="button"
					class="w-full rounded-full bg-gradient-to-b from-gw-brand to-gw-forest py-4 text-base font-bold text-white shadow-btn transition duration-300 ease-gw-smooth hover:brightness-[1.05] active:scale-[0.99]"
					@click="next"
				>
					{{ ok ? t("result.nextButton") : t("result.retryButton") }}
				</button>
				<button
					type="button"
					class="w-full rounded-full border-2 border-gw-forest/85 bg-white py-3.5 text-base font-bold text-gw-forest transition hover:bg-gw-mint/40"
					@click="router.push({ name: 'stage' })"
				>
					{{ t("result.backMapButton") }}
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
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
