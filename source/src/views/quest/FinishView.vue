<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import {
	LEVEL_COMPLETE_STICKER_SRC,
	getProfile,
	getStage,
	getFinishClaimedCount,
} from "@/lib/demoState";
import { incrementLocalFinishClaimIfNoApiBase } from "@/lib/provisionalFinishClaim";
import { resolveRewardClaimPresentation } from "@/lib/rewardClaimPresentation";
import { getViteApiBase } from "@/lib/apiBase";
import { useI18n } from "@/composables/useI18n";
import { FINISH_REWARD_SLOTS, GAME_CONFIG } from "@/constants";

const router = useRouter();
const { t } = useI18n();
const stage = ref(GAME_CONFIG.TOTAL_STAGES);
const name = ref("");
const employeeId = ref("");
const showClaimModal = ref(false);
const claimedCount = ref(0);
const maxSlots = ref(FINISH_REWARD_SLOTS);
const statusLoadState = ref<"loading" | "ok" | "error">("loading");
const statusError = ref("");

const userLine = computed(() => {
	const id = employeeId.value.trim();
	if (!id || id === "—") return name.value;
	return `${name.value}（${id}）`;
});

const isClaimFull = computed(
	() => claimedCount.value >= maxSlots.value && maxSlots.value > 0,
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
	const r = await resolveRewardClaimPresentation(null, getFinishClaimedCount);
	if (r.loadState === "error") {
		statusLoadState.value = "error";
		statusError.value = r.error;
		return;
	}
	claimedCount.value = r.claimed;
	maxSlots.value = r.maxSlots;
	statusLoadState.value = "ok";
	if (claimedCount.value >= maxSlots.value && maxSlots.value > 0) {
		await router.replace({ name: "finishClaimSuccess" });
	}
}

function retryLoadStatus() {
	void refreshClaimed();
}

onMounted(() => {
	stage.value = getStage();
	const p = getProfile();
	name.value = p.name || t("finish.fallbackName");
	employeeId.value = p.employeeId || "—";
	void refreshClaimed();
});

function openClaimModal() {
	if (isClaimFull.value || statusLoadState.value !== "ok") return;
	showClaimModal.value = true;
}

function closeClaimModal() {
	showClaimModal.value = false;
}

function confirmClaim() {
	showClaimModal.value = false;
	/** 已設定 API 時：原型仍導向成功頁，由 dashboard 反映伺服器狀態（正式上線應改為核銷 API 成功後再導頁或重新整理） */
	if (getViteApiBase()) {
		router.push({ name: "finishClaimSuccess" });
		return;
	}
	incrementLocalFinishClaimIfNoApiBase();
	claimedCount.value = getFinishClaimedCount();
	if (claimedCount.value >= maxSlots.value) {
		router.push({ name: "finishClaimSuccess" });
	}
}

function goHome() {
	router.push({ name: "welcome" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f5f6f4]">
		<AppHeader
			class="relative z-[2]"
			:stage="stage"
			:completed-override="GAME_CONFIG.TOTAL_STAGES"
			show-progress
			show-user
		/>

		<main class="relative z-[2] flex flex-1 flex-col px-4 pb-6 pt-4 sm:mx-auto sm:max-w-md sm:w-full">
			<div class="rounded-2xl bg-gw-brand px-4 py-4 text-center shadow-md">
				<p class="text-xs font-bold uppercase tracking-wider text-white/90">
					{{ t("finish.bannerTitle") }}
				</p>
				<p class="mt-1 font-display text-xl font-bold text-white">
					{{ t("finish.title") }}
				</p>
			</div>

			<div
				class="mt-6 overflow-hidden rounded-3xl border border-gw-brand/15 bg-[#f5f0e8] shadow-card-sm ring-1 ring-black/[0.04]"
			>
				<img
					:src="LEVEL_COMPLETE_STICKER_SRC"
					width="1200"
					height="900"
					:alt="t('finish.imageAlt')"
					class="aspect-[4/3] h-auto w-full object-cover object-center"
					loading="lazy"
					decoding="async"
				/>
			</div>

			<p class="mt-8 text-center text-base font-bold leading-relaxed text-gw-navy">
				{{ t("finish.completeMessage") }}
			</p>

			<p class="mt-4 text-center text-base font-bold text-gw-navy">
				{{ userLine }}
			</p>

			<section class="mt-8">
				<h2 class="text-center text-base font-bold text-[#b45309]">
					{{ t("finish.statusTitle") }}
				</h2>
				<div
					v-if="statusLoadState === 'loading'"
					class="mt-6 text-center text-sm text-neutral-500"
					aria-live="polite"
				>
					{{ t("claimSuccess.loadingStatus") }}
				</div>
				<div
					v-else-if="statusLoadState === 'error'"
					class="mt-6 rounded-xl border border-red-200 bg-red-50/90 px-3 py-3 text-center text-[12px] text-red-900"
					role="alert"
				>
					<p>{{ statusError }}</p>
					<button
						type="button"
						class="mt-2 text-[11px] font-semibold text-gw-brand underline underline-offset-2"
						@click="retryLoadStatus"
					>
						{{ t("claimSuccess.retryButton") }}
					</button>
				</div>
				<div v-else class="mt-6 flex justify-between gap-2 px-1">
					<div
						v-for="(label, i) in slotLabels"
						:key="i"
						class="flex flex-1 flex-col items-center"
					>
						<div
							:class="[
								'flex h-14 w-14 items-center justify-center rounded-full text-xl transition',
								slotActive(i)
									? 'bg-[#fecaca] text-[#78350f] shadow-sm ring-2 ring-white'
									: 'bg-neutral-200/90 text-neutral-500',
							]"
							aria-hidden="true"
						>
							🎁
						</div>
						<p class="mt-2 text-center text-[11px] font-semibold text-gw-navy/85">
							{{ label }}
						</p>
					</div>
				</div>
				<p
					v-if="statusLoadState === 'ok' && !isClaimFull && claimedCount > 0"
					class="mx-auto mt-4 max-w-[22rem] text-center text-[11px] leading-relaxed text-neutral-500"
				>
					{{ t("finish.loopHint", { maxSlots }) }}
				</p>
			</section>

			<div class="mt-auto flex flex-col gap-3 pt-10">
				<button
					type="button"
					class="w-full rounded-full py-4 text-base font-bold shadow-lg transition"
					:class="
						isClaimFull || statusLoadState !== 'ok'
							? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
							: 'bg-[#1a5f2a] text-white hover:brightness-110'
					"
					:disabled="isClaimFull || statusLoadState !== 'ok'"
					@click="openClaimModal"
				>
					{{ isClaimFull ? t("finish.claimButtonDone") : t("finish.claimButton") }}
				</button>
				<p
					v-if="statusLoadState === 'ok' && !isClaimFull"
					class="text-center text-[11px] leading-relaxed text-neutral-500"
				>
					{{ t("finish.staffHint") }}
				</p>
				<button
					type="button"
					class="w-full rounded-full border-2 border-[#1a5f2a] bg-white py-3.5 text-base font-bold text-[#1a5f2a] transition hover:bg-neutral-50"
					@click="goHome"
				>
					{{ t("finish.backHomeButton") }}
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />

		<Teleport to="body">
			<div
				v-if="showClaimModal"
				class="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px]"
				role="dialog"
				aria-modal="true"
				aria-labelledby="finish-claim-modal-title"
				@click.self="closeClaimModal"
			>
				<div
					class="w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
					@click.stop
				>
					<div
						class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gw-mint text-3xl"
						aria-hidden="true"
					>
						🎁
					</div>
					<h2 id="finish-claim-modal-title" class="mt-4 text-center text-lg font-bold text-gw-navy">
						{{ t("finish.modalTitle") }}
					</h2>
					<p class="mt-2 text-center text-sm text-neutral-600">
						{{ t("finish.modalMessage", { nextClaimIndex }) }}
					</p>
					<p class="mt-3 text-center text-[11px] text-neutral-500">
						{{ t("finish.staffHint") }}
					</p>
					<div class="mt-6 flex flex-col gap-2">
						<button
							type="button"
							class="w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110"
							@click="confirmClaim"
						>
							{{ t("finish.modalConfirmButton") }}
						</button>
						<button
							type="button"
							class="w-full rounded-full border-2 border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
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
