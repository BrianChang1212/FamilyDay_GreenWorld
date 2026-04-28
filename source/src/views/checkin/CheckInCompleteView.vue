<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { fetchCheckinStatus } from "@/api/checkinStatus";
import {
	CHECKIN_COMPLETE_STICKER_SRC,
	getCompanionCount,
	getProfile,
	isCheckInDone,
} from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();
const profile = computed(() => getProfile());
const companions = computed(() => getCompanionCount());
const statusLoadState = ref<"idle" | "loading" | "ok" | "error">("idle");
const statusCheckedIn = ref(false);
const statusCheckinAt = ref("");
const statusError = ref("");

async function loadCheckinStatus() {
	statusLoadState.value = "loading";
	statusError.value = "";
	try {
		const status = await fetchCheckinStatus(profile.value.employeeId);
		statusCheckedIn.value = status.checkedIn;
		statusCheckinAt.value = status.checkinAt ?? "";
		statusLoadState.value = "ok";
	} catch (err) {
		statusLoadState.value = "error";
		statusError.value =
			err instanceof Error && err.message
				? err.message
				: "Failed to load check-in status";
	}
}

onMounted(() => {
	const { name, employeeId } = profile.value;
	if (!name.trim() || !employeeId.trim()) {
		router.replace({ name: "checkin" });
		return;
	}
	if (!isCheckInDone()) {
		router.replace({ name: "checkin" });
	}
	void loadCheckinStatus();
});
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f7f8f6]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-8 pt-8 sm:mx-auto sm:max-w-md">
			<!-- 插圖佔位（稍後替換為正式素材） -->
			<div
				class="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-md ring-1 ring-black/[0.04]"
			>
				<div class="bg-gradient-to-b from-gw-mint/40 to-white px-4 pb-3 pt-6 text-center">
					<p class="text-xs font-bold tracking-wide text-gw-navy/80">
						{{ t("checkinComplete.statusTitle") }}
					</p>
					<p class="mt-1 text-[11px] text-neutral-600">
						{{ t("checkinComplete.statusSubtitle") }}
					</p>
				</div>
				<div class="border-t border-neutral-200/80 bg-gw-mint/10 ring-1 ring-inset ring-neutral-300/50">
					<div class="relative aspect-[5/4] w-full overflow-hidden">
						<img
							:src="CHECKIN_COMPLETE_STICKER_SRC"
							width="1024"
							height="1024"
							:alt="t('checkinComplete.imageAlt')"
							class="absolute inset-0 h-full w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
				<div class="flex justify-center bg-white px-4 pb-5 pt-4">
					<button
						type="button"
						class="rounded-full bg-gw-brand px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white opacity-90"
						disabled
					>
						{{ t("checkinComplete.viewDetails") }}
					</button>
				</div>
			</div>

			<h1 class="font-display mt-8 text-center text-2xl font-bold text-gw-brand">
				{{ t("checkinComplete.title") }}
			</h1>
			<p class="mt-2 text-center text-sm font-medium text-gw-navy">
				{{ t("checkinComplete.subtitle") }}
			</p>

			<div
				class="mt-8 overflow-hidden rounded-3xl border border-neutral-200/90 bg-[#f0f2ee] shadow-sm ring-1 ring-black/[0.03]"
			>
				<div class="flex items-center justify-between border-b border-neutral-200/80 px-4 py-3">
					<div class="flex items-center gap-2">
						<span class="flex h-6 w-6 items-center justify-center rounded bg-gw-brand text-xs text-white">✓</span>
						<span class="text-sm font-bold text-gw-navy">{{
							t("checkinComplete.infoTitle")
						}}</span>
					</div>
					<span
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gw-mint/80 text-sm text-gw-brand"
						aria-hidden="true"
						>✓</span
					>
				</div>
				<ul class="divide-y divide-neutral-200/70 px-2 py-1">
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>👤</span
						>
						<div>
							<p class="text-xs text-neutral-500">{{ t("checkin.form.name") }}</p>
							<p class="font-bold text-gw-navy">{{ profile.name }}</p>
						</div>
					</li>
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>🪪</span
						>
						<div>
							<p class="text-xs text-neutral-500">
								{{ t("checkin.form.employeeId") }}
							</p>
							<p class="font-bold text-gw-navy">{{ profile.employeeId }}</p>
						</div>
					</li>
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>👥</span
						>
						<div>
							<p class="text-xs text-neutral-500">
								{{ t("checkin.form.companions") }}
							</p>
							<p class="font-bold text-gw-navy">
								{{ companions }} {{ t("checkin.form.companionUnit") }}
							</p>
						</div>
					</li>
				</ul>
			</div>

			<div
				class="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-4 text-left text-sm text-amber-950/90"
				role="status"
			>
				<p
					v-if="statusLoadState === 'loading'"
					class="text-xs text-neutral-600"
				>
					{{ t("checkinComplete.apiLoading") }}
				</p>
				<p
					v-else-if="statusLoadState === 'error'"
					class="text-xs text-red-700"
				>
					{{ t("checkinComplete.apiError", { error: statusError }) }}
				</p>
				<p
					v-else-if="statusLoadState === 'ok'"
					class="text-xs text-neutral-600"
				>
					{{ t("checkinComplete.apiStatus", {
						checkedIn: statusCheckedIn ? t("checkinComplete.apiCheckedIn") : t("checkinComplete.apiNotCheckedIn"),
						checkinAt: statusCheckinAt || "N/A",
					}) }}
				</p>
				<p class="font-semibold text-gw-navy">
					{{ t("checkinComplete.claimTitle") }}
				</p>
				<p class="mt-2 text-neutral-700">
					{{ t("checkinComplete.claimHint", { giftLabel: t("checkinComplete.giftLabel") }) }}
				</p>
				<p class="mt-3 text-neutral-700">
					{{
						t("checkinComplete.gameHint", {
							qrLabel: t("checkinComplete.gameQrLabel"),
						})
					}}
				</p>
			</div>

			<p class="mt-8 text-center text-xs text-neutral-400">
				{{ t("footer.copyright") }}
			</p>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
