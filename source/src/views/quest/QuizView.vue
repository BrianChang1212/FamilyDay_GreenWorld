<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { fetchChallenge, submitChallengeAttempt } from "@/api/gameFlow";
import {
	choiceRowsForChallenge,
	questionForChallenge,
	stageIndexFromChallengeId,
} from "@/lib/challengeOptionLabels";
import {
	addCompletedStageId,
	getCompletedStageIds,
	getStage,
	setCompletedStageIdsFromApi,
	stageStickerSrc,
	stageTitle,
} from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";
import { GAME_CONFIG } from "@/constants";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const stage = ref(1);
const challengeId = ref("c1");
const question = ref("");
const optionRows = ref<{ key: string; label: string }[]>([]);
const selected = ref<string | null>(null);
const loadState = ref<"loading" | "ok" | "error">("loading");
const submitLoading = ref(false);
const errorText = ref("");

onMounted(() => {
	stage.value = getStage();
	const q = route.query.challengeId;
	if (typeof q === "string" && q.trim()) {
		challengeId.value = q.trim();
	}
	selected.value = null;
	const fromChallenge = stageIndexFromChallengeId(challengeId.value);
	stage.value = fromChallenge ?? getStage();
	loadChallenge();
});

const displayStage = computed(
	() => stageIndexFromChallengeId(challengeId.value) ?? stage.value,
);

const doneStationCount = computed(() => getCompletedStageIds().length);

const progressPct = computed(
	() => (doneStationCount.value / GAME_CONFIG.TOTAL_STAGES) * 100,
);

function loadChallenge() {
	loadState.value = "loading";
	errorText.value = "";
	fetchChallenge(challengeId.value)
		.then((data) => {
			challengeId.value = data.challengeId;
			question.value = questionForChallenge(
				data.challengeId,
				data.title || stageTitle(displayStage.value),
			);
			optionRows.value = choiceRowsForChallenge(
				data.challengeId,
				data.options,
			);
			loadState.value = "ok";
		})
		.catch(() => {
			loadState.value = "error";
			errorText.value = "題目載入失敗，請重試。";
		});
}

function confirm() {
	if (!selected.value) return;
	submitLoading.value = true;
	errorText.value = "";
	submitChallengeAttempt(challengeId.value, selected.value)
		.then((r) => {
			if (r.correct) {
				if (r.completedStageIds.length > 0) {
					setCompletedStageIdsFromApi(r.completedStageIds);
				} else {
					const sid = stageIndexFromChallengeId(challengeId.value);
					if (sid != null) {
						addCompletedStageId(sid);
					}
				}
			}
			router.push({
				name: "result",
				query: {
					ok: r.correct ? "1" : "0",
					challengeId: challengeId.value,
					nextChallengeId: r.nextChallengeId || "",
				},
			});
		})
		.catch(() => {
			errorText.value = "送出答案失敗，請稍後再試。";
		})
		.finally(() => {
			submitLoading.value = false;
		});
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f5f6f4]">
		<AppHeader
			class="relative z-[2]"
			:stage="stage"
			:completed-stages-count="doneStationCount"
			show-progress
			show-user
		/>

		<main class="relative z-[2] flex flex-1 flex-col px-4 pb-6 pt-4 sm:mx-auto sm:max-w-md sm:w-full">
			<div class="flex items-end justify-between gap-3">
				<div class="flex min-w-0 flex-1 items-end gap-3">
					<img
						:src="stageStickerSrc(displayStage)"
						width="112"
						height="112"
						:alt="t('quiz.stageAlt', { stationName: stageTitle(displayStage) })"
						class="h-14 w-14 shrink-0 rounded-2xl border border-neutral-200/90 bg-neutral-50 object-contain object-center shadow-sm"
						loading="lazy"
					/>
					<div class="min-w-0">
						<p class="text-sm font-bold text-gw-navy">{{ t("quiz.progressTitle") }}</p>
						<p class="mt-0.5 truncate text-xs text-neutral-500">{{ stageTitle(displayStage) }}</p>
					</div>
				</div>
				<p class="text-sm font-bold tabular-nums">
					<span class="text-gw-brand">{{ String(doneStationCount).padStart(2, "0") }}</span>
					<span class="text-neutral-400">
						/ {{ String(GAME_CONFIG.TOTAL_STAGES).padStart(2, "0") }}
					</span>
				</p>
			</div>
			<div class="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200 p-0.5">
				<div
					class="h-full rounded-full bg-gw-brand transition-[width] duration-500"
					:style="{ width: `${progressPct}%` }"
				/>
			</div>

			<div
				class="relative mt-6 rounded-3xl border border-neutral-200/90 bg-white p-5 shadow-md ring-1 ring-black/[0.04]"
			>
				<span class="text-lg text-gw-brand" aria-hidden="true">🍃</span>
				<p
					class="mt-4 text-base font-bold leading-relaxed text-gw-navy sm:text-lg"
				>
					{{
						loadState === "loading"
							? "題目載入中..."
							: loadState === "error"
								? errorText
								: question
					}}
				</p>
			</div>

			<div v-if="loadState === 'ok'" class="mt-5 flex flex-col gap-3">
				<button
					v-for="row in optionRows"
					:key="row.key"
					type="button"
					:class="[
						'flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition',
						selected === row.key
							? 'border-gw-brand bg-[#1a5f2a] text-white shadow-md'
							: 'border-neutral-200/90 bg-[#eef0ed] text-gw-navy hover:border-gw-brand/30',
					]"
					@click="selected = row.key"
				>
					<span>{{ row.label }}</span>
					<span
						:class="[
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
							selected === row.key ? 'border-white/80 bg-white/20' : 'border-neutral-300 bg-white',
						]"
					>
						<span v-if="selected === row.key" class="text-sm text-white">✓</span>
					</span>
				</button>
			</div>

			<div class="mt-8">
				<button
					type="button"
					:disabled="!selected || submitLoading || loadState !== 'ok'"
					class="w-full rounded-full py-4 text-base font-bold transition"
					:class="
						selected
							? 'bg-[#1a5f2a] text-white shadow-lg hover:brightness-110'
							: 'cursor-not-allowed bg-neutral-200 text-neutral-400'
					"
					@click="confirm"
				>
					{{ submitLoading ? "Submitting..." : t("common.confirm") }}
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
