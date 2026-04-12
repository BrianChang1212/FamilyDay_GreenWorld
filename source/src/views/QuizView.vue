<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import StageMascot from "@/components/doodles/StageMascot.vue";
import { getStage, stageTitle } from "@/lib/demoState";
import { getStageQuiz } from "@/lib/stageQuestions";

const router = useRouter();
const stage = ref(1);

const quiz = computed(() => getStageQuiz(stage.value));
const options = computed(() => [...quiz.value.options]);
const correct = computed(() => quiz.value.correct);
const selected = ref<string | null>(null);

onMounted(() => {
	stage.value = getStage();
	selected.value = null;
});

const progressPct = computed(() => (stage.value / 6) * 100);

function confirm() {
	if (!selected.value) return;
	const ok = selected.value === correct.value;
	router.push({ name: "result", query: { ok: ok ? "1" : "0" } });
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<PageCritters />
		<AppHeader class="relative z-[2]" :stage="stage" show-progress show-user />

		<main class="relative z-[2] flex flex-1 flex-col px-4 pb-4 pt-3">
			<div class="gw-surface flex items-center justify-between gap-3 px-4 py-4">
				<div class="flex min-w-0 items-center gap-3">
					<div class="relative shrink-0">
						<StageMascot :stage="stage" size="md" />
						<span
							class="absolute -bottom-0.5 -right-0.5 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gw-cta px-1.5 text-xs font-bold text-white shadow-md ring-2 ring-white"
							>{{ stage }}</span
						>
					</div>
					<div class="min-w-0">
						<p class="truncate text-base font-bold tracking-tight text-gw-navy">
							{{ stageTitle(stage) }}
						</p>
						<p class="gw-eyebrow mt-0.5">Knowledge challenge</p>
					</div>
				</div>
				<div
					class="shrink-0 rounded-xl bg-gradient-to-br from-neutral-100 to-white px-3.5 py-2 text-center shadow-inner ring-1 ring-black/5"
				>
					<p class="text-xs font-bold tabular-nums">
						<span class="text-gw-brand">{{ String(stage).padStart(2, "0") }}</span>
						<span class="text-neutral-400"> / 06</span>
					</p>
				</div>
			</div>

			<div class="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200/90 p-[3px] shadow-inner ring-1 ring-black/[0.04]">
				<div
					class="h-full rounded-full bg-gradient-to-r from-gw-brand via-emerald-400 to-teal-500 shadow-sm transition-all duration-500 ease-out"
					:style="{ width: `${progressPct}%` }"
				/>
			</div>

			<div class="gw-surface-elevated relative mt-6 p-5">
				<div
					class="pointer-events-none absolute right-4 top-4 h-20 w-20 rounded-full bg-gw-brand/[0.06] blur-2xl"
					aria-hidden="true"
				/>
				<div
					class="pointer-events-none absolute right-4 top-4 h-16 w-16 opacity-[0.06]"
					style="
						background-image: repeating-linear-gradient(
							0deg,
							#000,
							#000 2px,
							transparent 2px,
							transparent 4px
						);
					"
				/>
				<div class="relative flex items-center gap-2 text-sm font-bold text-gw-brand">
					<span class="text-base" aria-hidden="true">📖</span>
					生態問題
				</div>
				<p class="relative z-10 mt-4 text-lg font-bold leading-snug tracking-tight text-gw-navy">
					{{ quiz.question }}
				</p>
			</div>

			<div class="mt-5 grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
				<button
					v-for="opt in options"
					:key="opt"
					type="button"
					:class="[
						'flex min-h-[52px] items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition duration-200',
						selected === opt
							? 'border-gw-brand bg-gw-cta text-white shadow-btn-lg ring-1 ring-white/25'
							: 'border-neutral-200/90 bg-white/90 text-gw-navy shadow-sm ring-1 ring-black/[0.04] hover:border-gw-brand/30 hover:bg-white active:scale-[0.99]',
					]"
					@click="selected = opt"
				>
					<span class="leading-snug">{{ opt }}</span>
					<span
						:class="[
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
							selected === opt ? 'border-white/70 bg-white/15' : 'border-neutral-200 bg-white',
						]"
					>
						<span v-if="selected === opt" class="text-sm">✓</span>
					</span>
				</button>
			</div>

			<div class="mt-6">
				<button
					type="button"
					:disabled="!selected"
					class="w-full rounded-2xl py-4 text-base font-bold transition"
					:class="selected ? 'gw-btn-primary' : 'cursor-not-allowed bg-neutral-100 text-neutral-400'"
					@click="confirm"
				>
					確認答案
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
