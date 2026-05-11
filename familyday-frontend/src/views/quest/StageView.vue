<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { GAME_CONFIG } from "@/constants";
import { verifyStation, type VerifyStationHttpError } from "@/api/gameFlow";
import { useQrCameraScan } from "@/composables/useQrCameraScan";
import {
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

/** 到站畫面 vs 掃碼全屏（相機即時取景） */
const viewPhase = ref<"arrival" | "scanning">("arrival");

const scanVideoRef = ref<HTMLVideoElement | null>(null);
const qrScanLive = computed(() => viewPhase.value === "scanning");
const qrDecodePaused = computed(() => scanLoading.value);

/**
 * QR payload → 站台編號（1…TOTAL_STAGES）。
 * Supports:
 *   - Mock: stage-{n}-token
 *   - JWT-shaped: base64url payload with stageId / stage_id / sid
 */
function extractQrStageId(payload: string): number | null {
	const mockMatch = payload.match(/^stage-(\d+)-token$/);
	if (mockMatch) {
		const n = Number(mockMatch[1]);
		return Number.isFinite(n) &&
			n >= GAME_CONFIG.MIN_STAGE &&
			n <= GAME_CONFIG.TOTAL_STAGES
			? n
			: null;
	}
	const parts = payload.split(".");
	if (parts.length === 3) {
		try {
			const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
			const json = JSON.parse(atob(padded)) as Record<string, unknown>;
			const n = Number(json.stageId ?? json.stage_id ?? json.sid);
			return Number.isFinite(n) &&
				n >= GAME_CONFIG.MIN_STAGE &&
				n <= GAME_CONFIG.TOTAL_STAGES
				? n
				: null;
		} catch {
			return null;
		}
	}
	return null;
}

async function verifyFromDecodedQr(payload: string) {
	const token = payload.trim();
	if (!token) return;

	const qrStage = extractQrStageId(token);
	if (qrStage === null) {
		scanError.value = t("stage.scanQrUnrecognized");
		return;
	}

	if (isStageCompleted(qrStage)) {
		scanError.value = t("stage.scanQrStageAlreadyDone");
		return;
	}

	/* QR 決定進哪一關：與伺服器 verify 請求對齊 */
	setStage(qrStage);
	stage.value = qrStage;

	scanLoading.value = true;
	scanError.value = "";
	try {
		const cid = await verifyStation(qrStage, token);
		scanError.value = "";
		challengeId.value = cid;
		setPendingStationVerification(qrStage, cid);
		inZone.value = true;
		setInZone(true);
		await router.push({
			name: "quiz",
			query: { challengeId: cid },
		});
	} catch (_err: unknown) {
		const e = _err as Partial<VerifyStationHttpError>;
		if (e && typeof e.code === "string") {
			if (e.code === "STATION_QR_MISMATCH") {
				scanError.value = t("stage.scanQrMismatch");
			} else if (e.code === "STATION_QR_UNRECOGNIZED") {
				scanError.value = t("stage.scanQrUnrecognized");
			} else {
				scanError.value = t("stage.scanVerifyFailed");
			}
		} else {
			scanError.value = t("stage.scanVerifyFailed");
		}
		throw _err;
	} finally {
		scanLoading.value = false;
	}
}

const cameraSetupError = useQrCameraScan({
	videoRef: scanVideoRef,
	active: qrScanLive,
	paused: qrDecodePaused,
	onDecode: verifyFromDecodedQr,
});

/** 優先顯示相機權限／硬體錯誤，其次 API 錯誤 */
const scanUiMessage = computed(
	() => cameraSetupError.value || scanError.value,
);

const doneStationCount = computed(() => getCompletedStageIds().length);

onMounted(() => {
	const pending = getPendingStationVerification();
	if (pending) {
		stage.value = pending.stage;
		challengeId.value = pending.challengeId;
		setStage(pending.stage);
		inZone.value = true;
		setInZone(true);
	} else {
		stage.value = getStage();
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
	scanError.value = "";
	cameraSetupError.value = "";
	viewPhase.value = "scanning";
}

function closeScanUi() {
	viewPhase.value = "arrival";
	scanError.value = "";
	cameraSetupError.value = "";
}

function rowState(id: number): "done" | "open" {
	if (isStageCompleted(id)) return "done";
	return "open";
}
</script>

<template>
	<div
		class="gw-page-fill relative flex flex-1 flex-col bg-[#eef0eb]"
		:class="viewPhase === 'scanning' ? 'min-h-0 overflow-hidden' : 'min-h-min'"
	>
		<!-- 品牌條（與 Quiz / Result 對齊） -->
		<GwBrandBar v-if="viewPhase === 'arrival'" />

		<!-- 掃 QR：深灰底、標題紧贴取景上方、取景隨視窗等比縮放（vmin / dvh clamp）-->
		<div
			v-if="viewPhase === 'scanning'"
			class="gw-scan-sheet relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden bg-[#757575]"
		>
			<!-- 多重樹葉／自然紋路底紋（滿版 vector，裁切在卡片內） -->
			<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
				<div
					class="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_30%,rgba(255,255,255,0.055)_0%,transparent_58%)]"
				/>
				<svg
					class="absolute inset-0 h-full w-full text-white"
					viewBox="0 0 100 100"
					preserveAspectRatio="xMidYMid slice"
				>
					<defs>
						<path
							id="gw-scan-leaf-main"
							d="M118 14c29 28 41 76 29 117-14 52-61 82-114 71C48 223 13 206 12 169c6-62 72-118 136-147 18-9 42-22 62-31 26-15 54-29 74-51 9-10 8-29-12-31-42-15-105 41-154 105z"
						/>
						<path
							id="gw-scan-leaf-alt"
							d="M50 6C30 28 18 58 24 86c4 18 18 30 26 30s22-12 26-30c6-28-6-58-26-80z"
						/>
					</defs>
					<g fill="currentColor" opacity="0.055">
						<use href="#gw-scan-leaf-main" transform="translate(38,36) scale(0.13) rotate(-14 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(4,8) scale(0.062) rotate(-32 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(78,10) scale(0.055) rotate(38 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(2,58) scale(0.058) rotate(8 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(86,52) scale(0.048) rotate(-22 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(14,78) scale(0.052) rotate(44 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(68,72) scale(0.042) rotate(-8 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(52,4) scale(0.05) rotate(18 100 110)" />
						<use href="#gw-scan-leaf-main" transform="translate(30,92) scale(0.046) rotate(-42 100 110)" />
						<use href="#gw-scan-leaf-alt" transform="translate(62,22) scale(0.11) rotate(12 50 50)" />
						<use href="#gw-scan-leaf-alt" transform="translate(24,38) scale(0.08) rotate(-26 50 50)" />
						<use href="#gw-scan-leaf-alt" transform="translate(88,84) scale(0.07) rotate(55 50 50)" />
						<use href="#gw-scan-leaf-alt" transform="translate(8,28) scale(0.065) rotate(-12 50 50)" />
						<use href="#gw-scan-leaf-alt" transform="translate(44,62) scale(0.07) rotate(33 50 50)" />
					</g>
				</svg>
			</div>

			<div
				class="relative flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.65rem,env(safe-area-inset-bottom,0px))]
					ps-[max(1.25rem,env(safe-area-inset-left,0px))] pe-[max(1.25rem,env(safe-area-inset-right,0px))]
					pt-[max(0.5rem,env(safe-area-inset-top,0px))]
					sm:px-8 sm:pb-5 sm:pt-8"
			>
				<!-- 等比取景：邊長 = min(父層寬, 88vmin, 28rem, 視窗高度扣留白) —— 較前一版再大一圈 -->
				<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden pb-3 pt-1 sm:py-3">
					<div
						class="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-0"
					>
						<div
							class="flex w-full flex-col items-center gap-2 sm:gap-2.5"
						>
						<p
							class="w-full max-w-[min(100%,88vmin,28rem,calc(100dvh-12.5rem))] shrink-0 px-1 text-center text-[2.12rem] font-bold leading-tight tracking-wide text-white"
						>
							{{ t("stage.scanAlignTitle") }}
						</p>
						<p
							v-if="scanLoading"
							class="-mt-1 w-full shrink-0 text-center text-xs font-semibold text-white/80"
						>
							{{ t("stage.scanVerifying") }}
						</p>
						<div
							class="gw-scan-frame relative box-border aspect-square shrink-0 overflow-hidden rounded-[2rem]
								bg-black shadow-[inset_0_0_0_2px_rgba(255,255,255,0.45)] ring-[3px] ring-black/45
								w-[min(100%,88vmin,28rem,calc(100dvh-12.5rem))]"
						>
							<video
								ref="scanVideoRef"
								class="absolute inset-0 block h-full w-full object-cover"
								autoplay
								muted
								playsinline
								:aria-label="t('stage.scanVideoAria')"
							/>

							<div
								class="gw-scan-corner gw-scan-corner--tl pointer-events-none absolute left-4 top-4 z-[3]"
								aria-hidden="true"
							/>
							<div
								class="gw-scan-corner gw-scan-corner--tr pointer-events-none absolute right-4 top-4 z-[3]"
								aria-hidden="true"
							/>
							<div
								class="gw-scan-corner gw-scan-corner--bl pointer-events-none absolute bottom-4 left-4 z-[3]"
								aria-hidden="true"
							/>
							<div
								class="gw-scan-corner gw-scan-corner--br pointer-events-none absolute bottom-4 right-4 z-[3]"
								aria-hidden="true"
							/>

							<div class="gw-scan-beam-mask pointer-events-none absolute inset-4 z-[4] overflow-hidden rounded-2xl" aria-hidden="true">
								<div class="gw-scan-beam-line" />
							</div>
						</div>
						</div>
					</div>
				</div>

				<button
					type="button"
					class="relative mx-auto w-full max-w-[min(min(88vmin,28rem),calc(100vw-2.5rem))] shrink-0 rounded-[1.75rem] bg-[#2d5a41] px-6 py-[0.9rem] text-base font-semibold text-white shadow-[0_6px_22px_rgba(0,0,0,0.32)] ring-1 ring-black/10 transition hover:brightness-[1.05] active:brightness-95 sm:rounded-[2rem] sm:py-[0.95rem]"
					@click="closeScanUi"
				>
					<span class="flex items-center justify-center gap-2">
						<svg
							class="h-[1.05em] w-[1.05em] shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.35"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
						{{ t("stage.scanBackButton") }}
					</span>
				</button>

				<p
					v-if="scanUiMessage"
					class="relative shrink-0 overflow-hidden px-2 text-center text-[0.75rem] leading-snug text-red-100"
					role="alert"
				>
					<span
						class="inline-block max-w-full break-words rounded-xl border border-red-300/45 bg-red-950/55 px-3 py-2 text-center line-clamp-3"
					>
						{{ scanUiMessage }}
					</span>
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
						class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition"
						:class="
							rowState(id) === 'done'
								? 'cursor-default border-neutral-200/90 bg-white shadow-sm'
								: 'cursor-default border-neutral-100 bg-neutral-100/75'
						"
					>
						<span
							:class="[
								'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums',
								rowState(id) === 'done'
									? 'bg-[#2f7354] text-white'
									: 'bg-[#b0b0b0] text-white',
							]"
							>{{ id }}</span
						>
						<span class="min-w-0 flex-1 truncate font-semibold text-gw-navy">{{
							stageTitle(id)
						}}</span>
						<span
							v-if="rowState(id) === 'done'"
							class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[#ddeee4] px-2.5 py-1 text-xs font-bold text-[#2f7354]"
						>
							<span aria-hidden="true">✓</span>
							{{ t("stage.statusCompleted") }}
						</span>
						<span
							v-else
							class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-neutral-200/90 px-2.5 py-1 text-xs font-semibold text-neutral-500"
						>
							<svg
								class="h-3.5 w-3.5 shrink-0 opacity-90"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
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

		<AppFooter v-if="viewPhase === 'arrival'" class="relative z-[2]" />
	</div>
</template>

<style scoped>
.gw-scan-corner {
	position: absolute;
	width: var(--corner);
	height: var(--corner);
	border: 4px solid #fff;
	--corner: 3.125rem;
}

.gw-scan-corner--tl {
	border-right: none;
	border-bottom: none;
	border-top-left-radius: 1rem;
	border-top-right-radius: 0;
	border-bottom-left-radius: 0;
}

.gw-scan-corner--tr {
	border-left: none;
	border-bottom: none;
	border-top-right-radius: 1rem;
}

.gw-scan-corner--bl {
	border-right: none;
	border-top: none;
	border-bottom-left-radius: 1rem;
}

.gw-scan-corner--br {
	border-left: none;
	border-top: none;
	border-bottom-right-radius: 1rem;
}

@keyframes gw-scan-beam-bounce {
	0%,
	100% {
		top: 18%;
	}
	50% {
		top: 72%;
	}
}

.gw-scan-beam-line {
	position: absolute;
	left: 0;
	right: 0;
	top: 18%;
	height: 3px;
	border-radius: 9999px;
	background: linear-gradient(
		90deg,
		rgba(0, 242, 120, 0),
		rgba(0, 255, 157, 0.95),
		rgba(0, 235, 120, 0)
	);
	box-shadow:
		0 0 14px rgba(0, 255, 157, 0.85),
		0 0 4px rgba(255, 255, 255, 0.9);
	animation: gw-scan-beam-bounce 2.15s ease-in-out infinite;
}
</style>
