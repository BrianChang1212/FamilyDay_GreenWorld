<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { fetchChallenge, submitChallengeAttempt } from "@/api/gameFlow";
import {
	choiceRowsForChallenge,
	questionForChallenge,
	stageIndexFromChallengeId,
} from "@/lib/challengeOptionLabels";
import {
	addCompletedStageId,
	setCompletedStageIdsFromApi,
	getStage,
	stageTitle,
} from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const challengeId = ref("c1");
const question = ref("");
const optionRows = ref<{ key: string; label: string }[]>([]);
const selected = ref<string | null>(null);
const loadState = ref<"loading" | "ok" | "error">("loading");
const submitLoading = ref(false);
const loadErrorText = ref("");
const submitError = ref("");

function challengeStageIndex(): number {
	return stageIndexFromChallengeId(challengeId.value) ?? getStage();
}

onMounted(() => {
	const q = route.query.challengeId;
	if (typeof q === "string" && q.trim()) {
		challengeId.value = q.trim();
	}
	selected.value = null;
	submitError.value = "";
	loadChallenge();
});

function loadChallenge() {
	loadState.value = "loading";
	loadErrorText.value = "";
	submitError.value = "";
	fetchChallenge(challengeId.value)
		.then((data) => {
			challengeId.value = data.challengeId;
			const sid = challengeStageIndex();
			question.value = questionForChallenge(
				data.challengeId,
				data.title || stageTitle(sid),
			);
			optionRows.value = choiceRowsForChallenge(
				data.challengeId,
				data.options,
			);
			loadState.value = "ok";
		})
		.catch(() => {
			loadState.value = "error";
			loadErrorText.value = "題目載入失敗，請重試。";
		});
}

function confirm() {
	if (!selected.value) return;
	submitLoading.value = true;
	submitError.value = "";
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
			submitError.value = "送出答案失敗，請稍後再試。";
		})
		.finally(() => {
			submitLoading.value = false;
		});
}

const questionBody = computed(() => {
	if (loadState.value === "loading") return t("common.loading");
	if (loadState.value === "error") return loadErrorText.value;
	return question.value;
});
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col bg-[#eef0eb]">
		<GwBrandBar />

		<main
			class="relative z-[2] flex flex-1 flex-col px-4 pb-8 pt-5 sm:mx-auto sm:w-full sm:max-w-md"
		>
			<div class="relative mt-1">
				<div
					class="rounded-[1.35rem] border border-neutral-200/90 bg-white p-7 pt-8 shadow-md ring-1 ring-black/[0.04] sm:p-8 sm:pt-9"
				>
					<span
						class="pointer-events-none absolute -left-0.5 -top-1 text-4xl leading-none text-[#2f7354] drop-shadow-sm sm:text-[2.75rem]"
						aria-hidden="true"
						>🍃</span
					>
					<p
						class="text-lg font-bold leading-relaxed text-gw-navy sm:text-xl sm:leading-snug"
					>
						{{ questionBody }}
					</p>
				</div>
			</div>

			<div
				v-if="loadState === 'ok'"
				class="mt-6 flex flex-col gap-3.5 sm:gap-4"
			>
				<button
					v-for="row in optionRows"
					:key="row.key"
					type="button"
					:class="[
						'flex min-h-[3.85rem] w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left text-lg font-bold transition sm:min-h-[4rem] sm:px-6 sm:text-[1.125rem]',
						selected === row.key
							? 'border-orange-400 bg-orange-100 text-gw-navy shadow-sm ring-1 ring-orange-200/80'
							: 'border-neutral-200 bg-neutral-100 text-gw-navy hover:border-neutral-300',
					]"
					@click="selected = row.key"
				>
					<span class="min-w-0 flex-1">{{ row.label }}</span>
					<span
						:class="[
							'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition sm:h-10 sm:w-10',
							selected === row.key
								? 'border-orange-500 bg-orange-500 text-white shadow-inner'
								: 'border-neutral-300 bg-white',
						]"
						aria-hidden="true"
					>
						<svg
							v-if="selected === row.key"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 13l4 4L19 7" />
						</svg>
					</span>
				</button>
			</div>

			<div class="mt-8 sm:mt-9">
				<button
					type="button"
					:disabled="!selected || submitLoading || loadState !== 'ok'"
					class="w-full rounded-2xl py-[1.05rem] text-lg font-bold transition sm:py-5"
					:class="
						selected
							? 'bg-[#2f7354] text-white shadow-lg hover:brightness-110'
							: 'cursor-not-allowed bg-neutral-200 text-neutral-500'
					"
					@click="confirm"
				>
					{{ submitLoading ? t("common.submitting") : t("common.submit") }}
				</button>
				<p
					v-if="submitError"
					class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
					role="alert"
				>
					{{ submitError }}
				</p>
			</div>
		</main>
	</div>
</template>
