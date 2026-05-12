<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { claimFinishReward, logoutGame } from "@/api/gameFlow";
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

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const name = ref("");
const employeeId = ref("");
const showClaimModal = ref(false);
const claimedCount = ref(0);
const bankedFullClears = ref(0);
const maxSlots = ref(FINISH_REWARD_SLOTS);
const statusLoadState = ref<"loading" | "ok" | "error">("loading");
const statusError = ref("");
const actionLoading = ref(false);
const actionError = ref("");
const claimSubmitting = ref(false);
const claimError = ref("");

const userLine = computed(() => {
	const id = employeeId.value.trim();
	if (!id || id === "—") return name.value;
	return `${name.value}（${id}）`;
});

const isClaimFull = computed(
	() => claimedCount.value >= maxSlots.value && maxSlots.value > 0,
);

/** 伺服器尚有「已通關結算、尚未領」的額度（bankedFullClears > rewardRedeemCount） */
const hasClaimCredit = computed(
	() => bankedFullClears.value > claimedCount.value,
);

const nextClaimIndex = computed(() =>
	Math.min(claimedCount.value + 1, maxSlots.value),
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

function openClaimModal() {
	if (
		isClaimFull.value ||
		statusLoadState.value !== "ok" ||
		!hasClaimCredit.value
	) {
		return;
	}
	claimError.value = "";
	showClaimModal.value = true;
}

function closeClaimModal() {
	if (claimSubmitting.value) return;
	showClaimModal.value = false;
	claimError.value = "";
}

async function confirmClaim() {
	claimError.value = "";
	if (getViteApiBase()) {
		claimSubmitting.value = true;
		try {
			await claimFinishReward();
			showClaimModal.value = false;
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
			void refreshClaimed();
		} finally {
			claimSubmitting.value = false;
		}
		return;
	}
	showClaimModal.value = false;
	incrementLocalFinishClaimIfNoApiBase();
	await refreshClaimed();
}

function goHome() {
	actionLoading.value = true;
	actionError.value = "";
	logoutGame()
		.catch(() => {
			actionError.value = "登出 API 失敗，已改用前端返回首頁。";
		})
		.finally(() => {
			actionLoading.value = false;
			router.push({ name: "welcome" });
		});
}

</script>

<template>
	<div
		class="gw-page-fill relative flex min-h-min flex-1 flex-col bg-[#eef0eb]"
	>
		<GwBrandBar />

		<main
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
						<svg
							class="h-6 w-6 shrink-0 text-[#2f7354]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="9" r="5" />
							<path d="M8 14l-1.5 8 5.5-3 5.5 3L16 14" />
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
							<div
								:class="[
									'flex h-[4.75rem] w-full max-w-[6.5rem] items-center justify-center rounded-xl border-2 transition sm:h-[5.25rem]',
									slotActive(i)
										? 'border-orange-200 bg-orange-50/90 shadow-sm'
										: 'border-dashed border-neutral-300 bg-white',
								]"
							>
								<svg
									class="h-9 w-9 sm:h-10 sm:w-10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									:class="
										slotActive(i) ? 'text-orange-500' : 'text-neutral-400'
									"
									aria-hidden="true"
								>
									<path
										d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
									/>
									<path
										d="M4 12h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5a3.5 3.5 0 0 1-7 0H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z"
									/>
									<path d="M12 8v13" />
								</svg>
							</div>
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
					@click="openClaimModal"
				>
					{{ isClaimFull ? t("finish.claimButtonDone") : t("finish.claimButton") }}
				</button>
				<div
					v-if="isClaimFull && statusLoadState === 'ok'"
					class="pt-2"
				>
					<button
						type="button"
						class="w-full rounded-2xl border-2 border-[#2f7354]/25 bg-transparent py-3.5 text-base font-bold text-[#2f7354] transition hover:bg-white/80"
						:disabled="actionLoading"
						@click="goHome"
					>
						{{ actionLoading ? t("common.loading") : t("finish.backHomeButton") }}
					</button>
				</div>
				<p
					v-if="actionError"
					class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
					role="alert"
				>
					{{ actionError }}
				</p>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />

		<Teleport to="body">
			<div
				v-if="showClaimModal"
				class="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm"
				role="dialog"
				aria-modal="true"
				aria-labelledby="finish-claim-modal-title"
				@click.self="closeClaimModal"
			>
				<div
					class="w-full max-w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-[1.35rem] border border-neutral-200/90 bg-[#fafaf8] p-8 shadow-2xl ring-1 ring-black/[0.03]"
					@click.stop
				>
					<div class="flex flex-col items-center">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full bg-[#d9ead3] shadow-inner ring-1 ring-[#2f7354]/10"
							aria-hidden="true"
						>
							<svg
								class="h-11 w-11 text-[#2f7354]"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
								/>
								<path
									d="M4 12h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5a3.5 3.5 0 0 1-7 0H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z"
								/>
								<path d="M12 8v13" />
							</svg>
						</div>
						<h2
							id="finish-claim-modal-title"
							class="mt-6 text-center text-xl font-bold text-neutral-900"
						>
							{{ t("finish.modalTitle") }}
						</h2>
						<p class="mt-3 text-center text-[0.95rem] leading-relaxed text-neutral-600">
							{{ t("finish.modalMessage", { nextClaimIndex }) }}
						</p>
						<p class="mt-5 text-center text-sm text-neutral-400">
							{{ t("finish.modalStaffInstruction") }}
						</p>
					</div>
					<p
						v-if="claimError"
						class="mt-4 rounded-xl border border-red-200 bg-red-50/95 px-3 py-2.5 text-center text-[12px] leading-snug text-red-900"
						role="alert"
					>
						{{ claimError }}
					</p>
					<div class="mt-8 flex flex-col gap-3">
						<button
							type="button"
							class="w-full rounded-2xl bg-[#2f7354] py-4 text-lg font-bold text-white shadow-md transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
							:disabled="claimSubmitting"
							@click="confirmClaim"
						>
							{{ claimSubmitting ? t("common.loading") : t("finish.modalConfirmButton") }}
						</button>
						<button
							type="button"
							class="w-full rounded-2xl bg-neutral-200 py-[0.95rem] text-base font-bold text-neutral-600 transition enabled:hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
							:disabled="claimSubmitting"
							@click="closeClaimModal"
						>
							{{ t("common.cancel") }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
