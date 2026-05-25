<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { claimFinishReward } from "@/api/gameFlow";
import {
	FINISH_PAGE_HERO_SRC,
	getProfile,
	getFinishClaimedCount,
} from "@/lib/demoState";
import { incrementLocalFinishClaimIfNoApiBase } from "@/lib/provisionalFinishClaim";
import { resolveRewardClaimPresentation, parseMockClaimedQueryParam } from "@/lib/rewardClaimPresentation";
import { parseApiErrorCode } from "@/lib/parseApiErrorJson";
import { getViteApiBase } from "@/lib/apiBase";
import { useI18n } from "@/composables/useI18n";
import { FINISH_REWARD_SLOTS } from "@/constants";
import { useQrCameraScan } from "@/composables/useQrCameraScan";
import { isClaimToken } from "@/lib/claimPayload";

const route = useRoute();
const { t } = useI18n();
const name = ref("");
const employeeId = ref("");
const claimedCount = ref(0);
const bankedFullClears = ref(0);
const maxSlots = ref(FINISH_REWARD_SLOTS);
const statusLoadState = ref<"loading" | "ok" | "error">("loading");
const statusError = ref("");
const claimSubmitting = ref(false);
const claimError = ref("");

/** 領獎防誤領：點按鈕 → 進掃 QR 全屏；掃到工作人員 QR 才呼叫 claim API */
const viewPhase = ref<"main" | "scanning">("main");
const scanVideoRef = ref<HTMLVideoElement | null>(null);
const scanError = ref("");
const qrScanLive = computed(() => viewPhase.value === "scanning");
const qrDecodePaused = computed(() => claimSubmitting.value);

const userLine = computed(() => {
	const id = employeeId.value.trim();
	if (!id || id === "—") return name.value;
	return `${name.value}（${id}）`;
});

const isClaimFull = computed(
	() => claimedCount.value >= maxSlots.value && maxSlots.value > 0,
);

/** 通關過至少一輪（bankedFullClears >= 1）且未達上限 */
const hasClaimCredit = computed(
	() => bankedFullClears.value >= 1,
);

const slotLabels = computed(() => {
	const c = claimedCount.value;
	const cap = maxSlots.value;
	return Array.from({ length: cap }, (_, i) =>
		c > i ? t("claimSuccess.slotClaimed") : t("claimSuccess.slotPending"),
	);
});

function slotActive(index: number): boolean {
	return claimedCount.value > index;
}

async function refreshClaimed(): Promise<void> {
	statusLoadState.value = "loading";
	statusError.value = "";
	const mockClaimed = parseMockClaimedQueryParam(
		route.query.mock_claimed,
		FINISH_REWARD_SLOTS,
	);
	const r = await resolveRewardClaimPresentation(
		mockClaimed,
		getFinishClaimedCount,
	);
	if (r.loadState === "error") {
		statusLoadState.value = "error";
		statusError.value = r.error;
		return;
	}
	claimedCount.value = r.claimed;
	maxSlots.value = r.maxSlots;
	bankedFullClears.value = r.bankedFullClears;
	statusLoadState.value = "ok";
}

function retryLoadStatus() {
	void refreshClaimed();
}

onMounted(() => {
	const p = getProfile();
	name.value = p.name || t("finish.fallbackName");
	employeeId.value = p.employeeId || "—";
	void refreshClaimed();
});

watch(
	() => route.query.mock_claimed,
	() => {
		void refreshClaimed();
	},
);

function openClaimScanner() {
	if (
		isClaimFull.value ||
		statusLoadState.value !== "ok" ||
		!hasClaimCredit.value
	) {
		return;
	}
	claimError.value = "";
	scanError.value = "";
	cameraSetupError.value = "";
	viewPhase.value = "scanning";
}

function closeScanUi() {
	if (claimSubmitting.value) return;
	viewPhase.value = "main";
	scanError.value = "";
	cameraSetupError.value = "";
}

async function submitClaim(): Promise<void> {
	claimError.value = "";
	if (!getViteApiBase()) {
		incrementLocalFinishClaimIfNoApiBase();
		viewPhase.value = "main";
		await refreshClaimed();
		return;
	}
	claimSubmitting.value = true;
	try {
		await claimFinishReward();
		viewPhase.value = "main";
		await refreshClaimed();
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		const code = parseApiErrorCode(msg);
		if (code === "REWARD_CLAIM_LIMIT_REACHED") {
			claimError.value = t("finish.rewardLimitReached", {
				maxSlots: maxSlots.value,
			});
		} else if (code === "REWARD_CLAIM_NOT_ELIGIBLE") {
			claimError.value = t("finish.rewardClaimNotEligible");
		} else if (code === "FINISH_CLAIM_NOT_READY") {
			claimError.value = t("finish.rewardClaimNotReady");
		} else {
			claimError.value =
				msg.length > 180 ? `${msg.slice(0, 180)}…` : msg;
		}
		viewPhase.value = "main";
		void refreshClaimed();
	} finally {
		claimSubmitting.value = false;
	}
}

async function onScanDecode(payload: string): Promise<void> {
	if (!isClaimToken(payload)) {
		scanError.value = t("finish.claimScanQrUnrecognized");
		return;
	}
	scanError.value = "";
	await submitClaim();
}

const cameraSetupError = useQrCameraScan({
	videoRef: scanVideoRef,
	active: qrScanLive,
	paused: qrDecodePaused,
	onDecode: onScanDecode,
});

const scanUiMessage = computed(
	() => cameraSetupError.value || scanError.value,
);

</script>

<template>
	<div
		class="gw-page-fill relative flex flex-1 flex-col bg-[#eef0eb]"
		:class="viewPhase === 'scanning' ? 'min-h-0 overflow-hidden' : 'min-h-min'"
	>
		<GwBrandBar v-if="viewPhase === 'main'" />

		<!-- 領獎掃 QR：與 StageView 同款（深灰底、置中取景框、返回鍵） -->
		<div
			v-if="viewPhase === 'scanning'"
			class="gw-scan-sheet relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden bg-[#757575]"
		>
			<div
				class="pointer-events-none absolute inset-0 overflow-hidden"
				aria-hidden="true"
			>
				<div
					class="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_30%,rgba(255,255,255,0.055)_0%,transparent_58%)]"
				/>
			</div>

			<div
				class="relative flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.65rem,env(safe-area-inset-bottom,0px))]
					ps-[max(1.25rem,env(safe-area-inset-left,0px))] pe-[max(1.25rem,env(safe-area-inset-right,0px))]
					pt-[max(0.5rem,env(safe-area-inset-top,0px))]
					sm:px-8 sm:pb-5 sm:pt-8"
			>
				<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden pb-3 pt-1 sm:py-3">
					<div
						class="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-0"
					>
						<div class="flex w-full flex-col items-center gap-2 sm:gap-2.5">
							<p
								class="w-full max-w-[min(100%,88vmin,28rem,calc(100dvh-12.5rem))] shrink-0 px-1 text-center text-[2.12rem] font-bold leading-tight tracking-wide text-white"
							>
								{{ t("finish.claimScanAlignTitle") }}
							</p>
							<p
								v-if="claimSubmitting"
								class="-mt-1 w-full shrink-0 text-center text-xs font-semibold text-white/80"
							>
								{{ t("finish.claimScanVerifying") }}
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
									:aria-label="t('finish.claimScanVideoAria')"
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
								<div
									class="gw-scan-beam-mask pointer-events-none absolute inset-4 z-[4] overflow-hidden rounded-2xl"
									aria-hidden="true"
								>
									<div class="gw-scan-beam-line" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<button
					type="button"
					class="relative mx-auto w-full max-w-[min(min(88vmin,28rem),calc(100vw-2.5rem))] shrink-0 rounded-[1.75rem] bg-[#2d5a41] px-6 py-[0.9rem] text-base font-semibold text-white shadow-[0_6px_22px_rgba(0,0,0,0.32)] ring-1 ring-black/10 transition hover:brightness-[1.05] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-[2rem] sm:py-[0.95rem]"
					:disabled="claimSubmitting"
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
						{{ t("finish.claimScanBackButton") }}
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

		<main
			v-else
			class="relative z-[2] flex flex-1 flex-col px-4 pb-8 pt-5 sm:mx-auto sm:w-full sm:max-w-md"
		>
			<div
				class="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_12px_40px_-12px_rgba(15,31,46,0.12)] ring-1 ring-black/[0.04]"
			>
				<img
					:src="FINISH_PAGE_HERO_SRC"
					width="1200"
					height="900"
					:alt="t('finish.imageAlt')"
					class="aspect-[4/3] h-auto w-full object-cover object-center"
					loading="lazy"
					decoding="async"
				/>
			</div>

			<h1
				class="mt-8 text-center font-display text-[2rem] font-extrabold leading-[1.15] tracking-tight text-[#2f7354] sm:text-[2.5rem] md:text-[2.65rem]"
			>
				{{ t("finish.headline") }}
			</h1>
			<p
				class="mx-auto mt-4 max-w-[26rem] text-center text-[0.95rem] leading-relaxed text-neutral-600 sm:text-base"
			>
				{{ t("finish.completeMessage") }}
			</p>
			<p
				class="mt-5 text-center text-lg font-bold tabular-nums tracking-tight text-gw-navy sm:text-xl"
			>
				{{ userLine }}
			</p>

			<section class="mt-8">
				<div
					v-if="statusLoadState === 'loading'"
					class="rounded-2xl bg-neutral-100/95 px-4 py-10 text-center text-sm text-neutral-500"
					aria-live="polite"
				>
					{{ t("claimSuccess.loadingStatus") }}
				</div>
				<div
					v-else-if="statusLoadState === 'error'"
					class="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-4 text-center text-[12px] text-red-900"
					role="alert"
				>
					<p>{{ statusError }}</p>
					<button
						type="button"
						class="mt-3 text-[11px] font-semibold text-[#2f7354] underline underline-offset-2"
						@click="retryLoadStatus"
					>
						{{ t("claimSuccess.retryButton") }}
					</button>
				</div>
				<div
					v-else-if="statusLoadState === 'ok'"
					class="rounded-2xl bg-neutral-100/95 px-4 py-6 ring-1 ring-neutral-200/80"
				>
					<div class="flex items-center justify-center gap-2">
						<!-- 領獎狀態：圓形獎章 + 五角星 + 雙緞帶 V 底 (與設計稿對齊) -->
						<svg
							class="h-6 w-6 shrink-0 text-[#2f7354]"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								fill="currentColor"
								d="M 9.2 12 L 7.5 21 L 10 19 L 11.6 21 L 11 12 Z"
							/>
							<path
								fill="currentColor"
								d="M 13 12 L 12.4 21 L 14 19 L 16.5 21 L 14.8 12 Z"
							/>
							<circle fill="currentColor" cx="12" cy="9" r="5.5" />
							<path
								fill="#fff"
								d="M 12 6 L 12.71 8.07 L 14.86 8.07 L 13.07 9.35 L 13.76 11.43 L 12 10.15 L 10.24 11.43 L 10.93 9.35 L 9.14 8.07 L 11.29 8.07 Z"
							/>
						</svg>
						<h2 class="text-center text-base font-bold text-neutral-800">
							{{ t("finish.statusTitle") }}
						</h2>
					</div>

					<p
						v-if="isClaimFull"
						class="mx-auto mt-4 max-w-[22rem] rounded-xl border border-amber-200/90 bg-amber-50/95 px-3 py-3 text-center text-[12px] font-medium leading-relaxed text-amber-950"
						role="status"
					>
						{{ t("finish.rewardLimitReached", { maxSlots }) }}
					</p>

					<div class="mt-6 flex justify-center gap-2 sm:gap-3">
						<div
							v-for="(label, i) in slotLabels"
							:key="i"
							class="flex min-w-0 flex-1 flex-col items-center"
						>
							<!-- 已領取：橘色禮盒；未領取：灰色虛線禮盒（設計師原版 PNG） -->
							<img
								:src="slotActive(i)
									? '/images/Icon_gift_s_active.png'
									: '/images/Icon_gift_s_disabled.png'"
								width="222"
								height="222"
								:alt="slotActive(i)
									? t('claimSuccess.slotClaimed')
									: t('claimSuccess.slotPending')"
								class="h-[4.75rem] w-full max-w-[6.5rem] object-contain sm:h-[5.25rem]"
								loading="lazy"
								decoding="async"
							/>
							<p
								:class="[
									'mt-2.5 text-center text-[11px] font-semibold sm:text-xs',
									slotActive(i) ? 'text-orange-700/90' : 'text-neutral-400',
								]"
							>
								{{ label }}
							</p>
						</div>
					</div>
				</div>
			</section>

			<p
				v-if="statusLoadState === 'ok' && !isClaimFull && hasClaimCredit"
				class="mt-8 text-center text-sm font-medium text-neutral-600"
			>
				{{ t("finish.staffHintClaim") }}
			</p>
			<p
				v-else-if="statusLoadState === 'ok' && !isClaimFull && !hasClaimCredit"
				class="mx-auto mt-8 max-w-[26rem] rounded-xl border border-amber-200/90 bg-amber-50/95 px-3 py-3 text-center text-[12px] font-medium leading-relaxed text-amber-950"
				role="status"
			>
				{{ t("finish.rewardWaitingBanked") }}
			</p>

			<div class="mt-3 flex flex-col gap-3">
				<button
					type="button"
					class="w-full rounded-2xl py-[1.05rem] text-lg font-bold shadow-md transition sm:py-5"
					:class="
						isClaimFull || statusLoadState !== 'ok' || !hasClaimCredit
							? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
							: 'bg-[#2f7354] text-white shadow-[0_8px_24px_rgba(47,115,84,0.35)] hover:brightness-110'
					"
					:disabled="
						isClaimFull || statusLoadState !== 'ok' || !hasClaimCredit
					"
					@click="openClaimScanner"
				>
					{{ isClaimFull ? t("finish.claimButtonDone") : t("finish.claimButton") }}
				</button>
				<p
					v-if="claimError"
					class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
					role="alert"
				>
					{{ claimError }}
				</p>
			</div>
		</main>

		<AppFooter v-if="viewPhase === 'main'" class="relative z-[2]" />
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
