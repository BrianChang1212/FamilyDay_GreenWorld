<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { GAME_CONFIG } from "@/constants";
import { verifyStation } from "@/api/gameFlow";
import {
	QR_SCAN_STICKER_SRC,
	clearPendingStationVerification,
	getCompletedStageIds,
	getInZone,
	getPendingStationVerification,
	getStage,
	isStageCompleted,
	setInZone,
	setPendingStationVerification,
	setStage,
	stageIds,
	stageStickerSrc,
	stageTitle,
	STAGE_PAGE_HERO_SRC,
} from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();
const stage = ref(1);
const inZone = ref(false);
const challengeId = ref("");
const scanError = ref("");
const scanLoading = ref(false);

/** 到站畫面 vs 模擬掃碼全屏 */
const viewPhase = ref<"arrival" | "scanning">("arrival");

const doneStationCount = computed(() => getCompletedStageIds().length);

onMounted(() => {
	stage.value = getStage();
	const pending = getPendingStationVerification();
	if (pending && pending.stage === stage.value) {
		challengeId.value = pending.challengeId;
		setInZone(true);
		inZone.value = true;
	} else {
		if (pending) clearPendingStationVerification();
		if (getInZone()) setInZone(false);
		inZone.value = false;
		challengeId.value = "";
	}
});

const stationName = computed(() => stageTitle(stage.value));
const stationSticker = computed(() => stageStickerSrc(stage.value));

function startQuiz() {
	const cid = challengeId.value.trim();
	if (!cid) {
		scanError.value = "請先完成掃碼驗證，再開始作答。";
		return;
	}
	router.push({
		name: "quiz",
		query: { challengeId: cid },
	});
}

function openScanUi() {
	viewPhase.value = "scanning";
}

function closeScanUi() {
	viewPhase.value = "arrival";
}

function finishScanDemo() {
	scanLoading.value = true;
	scanError.value = "";
	verifyStation(stage.value, `stage-${stage.value}-token`)
		.then((cid) => {
			scanError.value = "";
			challengeId.value = cid;
			setPendingStationVerification(stage.value, cid);
			inZone.value = true;
			setInZone(true);
			viewPhase.value = "arrival";
		})
		.catch((err) => {
			scanError.value =
				err instanceof Error && err.message
					? "站點驗證失敗，請重新掃描。"
					: "站點驗證失敗，請稍後再試。";
		})
		.finally(() => {
			scanLoading.value = false;
		});
}

function rowState(id: number): "done" | "current" | "open" {
	if (isStageCompleted(id)) return "done";
	if (id === stage.value) return "current";
	return "open";
}

function selectStage(id: number) {
	if (isStageCompleted(id)) return;
	setStage(id);
	stage.value = id;
	setInZone(false);
	inZone.value = false;
	clearPendingStationVerification();
	challengeId.value = "";
	scanError.value = "";
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col bg-[#eef0eb]">
		<!-- 品牌條（與 Quiz / Result 對齊） -->
		<GwBrandBar v-if="viewPhase === 'arrival'" />

		<!-- —— 模擬掃碼全屏（深色半透明 + 毛玻璃） —— -->
		<div
			v-if="viewPhase === 'scanning'"
			class="relative z-[2] flex min-h-full flex-1 flex-col"
		>
			<GwBrandBar />

			<div
				class="relative flex flex-1 flex-col bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(47,115,84,0.18)_0%,transparent_55%),linear-gradient(180deg,rgba(26,34,30,0.34)_0%,rgba(26,34,30,0.42)_100%)] px-5 pb-8 pt-6 backdrop-blur-xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.08]"
			>
				<!-- 淡葉紋水印 -->
				<div
					class="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.09]"
					aria-hidden="true"
				>
					<span
						class="absolute -left-[10%] top-[15%] select-none text-[18rem] text-white"
						>🍃</span
					>
					<span
						class="absolute -right-[8%] bottom-[10%] select-none text-[14rem] text-white"
						>🍃</span
					>
				</div>

				<h1 class="relative text-center text-lg font-bold text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]">
					{{ t("stage.scanTitle") }}
				</h1>
				<p class="relative mt-2 text-center text-xs text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
					{{ t("stage.scanHint") }}
				</p>

				<div class="relative mx-auto mt-8 w-full max-w-[18rem]">
					<div
						class="overflow-hidden rounded-2xl border border-white/25 bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.22)] ring-1 ring-white/15"
					>
						<img
							:src="QR_SCAN_STICKER_SRC"
							width="1024"
							height="1024"
							:alt="t('stage.qrImageAlt')"
							class="aspect-square h-auto w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>

				<div class="relative mt-auto flex flex-col gap-3 pt-8">
					<button
						type="button"
						class="w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110"
						:disabled="scanLoading"
						@click="finishScanDemo"
					>
						{{ scanLoading ? t("stage.scanVerifying") : t("stage.scanSuccessButton") }}
					</button>
					<button
						type="button"
						class="flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/25 bg-white/10 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-white/15"
						@click="closeScanUi"
					>
						<span aria-hidden="true">←</span>
						{{ t("stage.scanBackButton") }}
					</button>
				</div>
				<p
					v-if="scanError"
					class="relative mt-3 rounded-xl border border-red-400/40 bg-red-950/50 px-3 py-2 text-center text-xs text-red-200"
					role="alert"
				>
					{{ scanError }}
				</p>
				<p class="relative mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
					{{ t("stage.prototypeLabel") }}
				</p>
			</div>
		</div>

		<!-- —— 到站／路線 —— -->
		<main
			v-else
			class="relative z-[2] flex flex-1 flex-col px-4 pb-6 pt-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-6"
		>
			<!-- 到站卡片（未解鎖時） -->
			<div
				v-if="!inZone"
				class="flex flex-1 flex-col items-center px-1"
			>
				<div
					class="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-md ring-1 ring-black/[0.04]"
				>
					<div class="bg-gw-mint/10 ring-1 ring-inset ring-neutral-300/55">
						<div class="w-full overflow-hidden">
							<img
								:src="STAGE_PAGE_HERO_SRC"
								width="1920"
								height="1080"
								:alt="t('stage.heroBannerAlt')"
								class="block h-auto w-full max-w-full"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>
				</div>

				<button
					type="button"
					class="mt-8 flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full bg-[#2f7354] text-[#c8e6d6] shadow-[0_12px_32px_rgba(47,115,84,0.35)] ring-4 ring-white/90 transition hover:brightness-110 active:scale-95"
					:aria-label="t('stage.scanAriaLabel')"
					@click="openScanUi"
				>
					<svg
						class="h-10 w-10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
						<circle cx="12" cy="13" r="3.5" />
						<path d="M5 9h1" />
					</svg>
				</button>

				<h2
					class="font-display mt-6 max-w-md px-2 text-center text-xl font-extrabold leading-snug text-[#2f7354] sm:text-[1.35rem]"
				>
					{{ t("stage.heroTitle") }}
				</h2>
				<p class="mt-4 max-w-md px-2 text-center text-sm leading-relaxed text-neutral-600">
					{{ t("stage.heroSubtitle") }}
				</p>
			</div>

			<!-- 已掃碼：開始作答 -->
			<div v-else class="flex flex-col items-center px-2 pt-4">
				<div
					class="w-full max-w-md rounded-3xl border border-gw-mint-soft bg-gw-mint/40 px-5 py-6 text-center ring-1 ring-gw-brand/10"
				>
					<img
						:src="stationSticker"
						width="1024"
						height="768"
						:alt="t('stage.stageImageAlt', { stationName })"
						class="mx-auto h-24 w-full max-w-[12rem] rounded-2xl border border-white/80 bg-white object-contain object-center shadow-sm"
						loading="lazy"
						decoding="async"
					/>
					<p class="mt-4 text-sm font-semibold text-gw-navy">
						{{ t("stage.unlocked") }}
					</p>
					<p class="mt-1 text-lg font-bold text-gw-brand">{{ stationName }}</p>
					<button
						type="button"
						class="mt-6 w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110"
						@click="startQuiz"
					>
						{{ t("stage.startQuizButton") }}
					</button>
					<p
						v-if="scanError"
						class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
						role="alert"
					>
						{{ scanError }}
					</p>
				</div>
			</div>

			<section
				class="mt-6 rounded-2xl border border-neutral-200/80 bg-[#e8eae4] p-4 shadow-sm ring-1 ring-black/[0.03]"
			>
				<div class="flex items-center justify-between gap-3">
					<div class="flex min-w-0 items-center gap-2">
						<span
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c8e6d6] text-[#2f7354]"
							aria-hidden="true"
						>
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M4 21v-9M4 21h16M10 21V9M10 9l8-6" stroke-linecap="round" stroke-linejoin="round" />
								<path d="M18 21V7" stroke-linecap="round" />
							</svg>
						</span>
						<h3 id="gw-stage-progress-heading" class="text-sm font-bold text-gw-navy">
							{{ t("header.progressLabel") }}
						</h3>
					</div>
					<span
						class="shrink-0 rounded-full bg-[#ddeee4] px-3 py-1 text-xs font-bold tabular-nums text-[#2f7354]"
					>
						{{ doneStationCount }}/{{ GAME_CONFIG.TOTAL_STAGES }}
					</span>
				</div>
				<p class="mt-1 pl-11 text-[11px] text-neutral-500">{{ t("stage.routeTitle") }}</p>

				<ul class="mt-4 space-y-2" aria-labelledby="gw-stage-progress-heading">
					<li
						v-for="id in stageIds()"
						:key="id"
						role="button"
						:tabindex="isStageCompleted(id) ? -1 : 0"
						:class="[
							'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
							rowState(id) === 'current'
								? 'border-[#2f7354]/40 bg-white shadow-sm'
								: rowState(id) === 'done'
									? 'cursor-default border-neutral-200 bg-white'
									: 'cursor-pointer border-neutral-100 bg-white hover:border-[#2f7354]/30 hover:bg-[#f7faf7]',
						]"
						@click="selectStage(id)"
						@keydown.enter.prevent="selectStage(id)"
						@keydown.space.prevent="selectStage(id)"
					>
						<span
							:class="[
								'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
								rowState(id) === 'done' || rowState(id) === 'current'
									? 'bg-[#2f7354] text-white'
									: 'bg-neutral-200 text-neutral-500',
							]"
							>{{ id }}</span
						>
						<span class="min-w-0 flex-1 truncate font-semibold text-gw-navy">{{
							stageTitle(id)
						}}</span>
						<span
							v-if="rowState(id) === 'done'"
							class="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-[#2f7354]"
						>
							<span aria-hidden="true">✓</span>
							{{ t("stage.statusCompleted") }}
						</span>
						<span
							v-else-if="rowState(id) === 'current'"
							class="shrink-0 whitespace-nowrap text-xs font-bold text-[#2f7354]"
						>
							{{ t("stage.statusInProgress") }}
						</span>
						<span
							v-else
							class="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-neutral-500"
						>
							<svg class="h-4 w-4 opacity-75" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path
									d="M17 8V6a5 5 0 00-10 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2h-2zM12 17a2 2 0 112 0 2 2 0 01-2 0zm3.75-9H8.25V6a3.75 3.75 0 017.5 0v2z"
								/>
							</svg>
							{{ t("stage.statusLocked") }}
						</span>
					</li>
				</ul>
			</section>
		</main>

		<AppFooter v-if="viewPhase === 'arrival'" class="relative z-[2] border-t-0 bg-transparent" />
	</div>
</template>
