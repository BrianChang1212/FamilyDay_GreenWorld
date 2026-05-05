<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { useRewardClaimPresentation } from "@/composables/useRewardClaimPresentation";
import { useI18n } from "@/composables/useI18n";
import {
	CLAIM_SUCCESS_STICKER_SRC,
	getProfile,
} from "@/lib/demoState";

const router = useRouter();
const { t } = useI18n();

const {
	claimed,
	maxSlots,
	statusLoadState,
	statusError,
	loadClaimPresentation,
} = useRewardClaimPresentation();

const name = ref("");
const employeeId = ref("");

function retryLoadStatus() {
	void loadClaimPresentation();
}

const userLine = computed(() => {
	const id = employeeId.value.trim();
	if (!id || id === "—") return name.value;
	return `${name.value}（${id}）`;
});

function slotActive(index: number): boolean {
	return claimed.value > index;
}

const slotLabels = computed(() => {
	const c = claimed.value;
	const cap = maxSlots.value;
	return Array.from({ length: cap }, (_, i) =>
		c > i ? t("claimSuccess.slotClaimed") : t("claimSuccess.slotPending"),
	);
});

const isRewardFullyClaimed = computed(
	() => maxSlots.value > 0 && claimed.value >= maxSlots.value,
);

onMounted(() => {
	const p = getProfile();
	name.value = p.name || t("finish.fallbackName");
	employeeId.value = p.employeeId || "—";
	void loadClaimPresentation();
});
</script>

<template>
	<div class="flex min-h-full flex-col bg-gw-sand">
		<main class="flex flex-1 flex-col px-5 pb-10 pt-8 sm:mx-auto sm:max-w-md sm:w-full">
			<!-- 慶祝卡 -->
			<div
				class="overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-[#ebe8e0] shadow-card-sm"
			>
				<div
					class="bg-gradient-to-r from-gw-forest to-gw-brand px-4 py-3 text-center shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
				>
					<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
						{{ t("claimSuccess.bannerTitle") }}
					</p>
				</div>
				<div class="relative px-4 pb-5 pt-5">
					<div
						class="overflow-hidden rounded-2xl border border-gw-brand/15 bg-[#f5f0e8] shadow-sm ring-1 ring-black/[0.04]"
					>
						<img
							:src="CLAIM_SUCCESS_STICKER_SRC"
							width="1200"
							height="900"
							:alt="t('claimSuccess.imageAlt')"
							class="aspect-[4/3] h-auto w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<div class="mt-4 flex justify-center">
						<button
							type="button"
							class="rounded-full bg-[#e85d04] px-8 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
							@click="router.push({ name: 'welcome' })"
						>
							{{ t("claimSuccess.continueButton") }}
						</button>
					</div>
				</div>
			</div>

			<h1 class="mt-10 text-center font-display text-2xl font-bold text-gw-forest sm:text-[1.65rem]">
				{{ t("claimSuccess.title") }}
			</h1>
			<p class="mt-3 text-center text-base font-bold text-gw-navy">
				{{ userLine }}
			</p>
			<p class="mx-auto mt-4 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
				{{ t("claimSuccess.successMessage") }}
			</p>

			<section class="mt-10">
				<h2 class="text-center text-base font-bold text-[#b45309]">
					{{ t("claimSuccess.statusTitle") }}
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
				<div
					v-if="statusLoadState === 'ok'"
					class="mt-6 flex justify-between gap-2 px-1"
				>
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
					v-if="statusLoadState === 'ok' && isRewardFullyClaimed"
					class="mx-auto mt-4 max-w-[22rem] rounded-xl border border-amber-200/90 bg-amber-50/95 px-3 py-3 text-center text-[12px] font-semibold leading-relaxed text-amber-950"
					role="status"
				>
					{{
						t("claimSuccess.rewardLimitReached", {
							claimed: claimed,
							maxSlots,
						})
					}}
				</p>
			</section>
		</main>

		<AppFooter class="mt-auto" />
	</div>
</template>
