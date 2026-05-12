<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
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

onMounted(() => {
	const { name, employeeId } = profile.value;
	if (!name.trim() || !employeeId.trim()) {
		router.replace({ name: "checkin" });
		return;
	}
	if (!isCheckInDone()) {
		router.replace({ name: "checkin" });
	}
});
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f7f8f6]">
		<GwBrandBar />

		<main
			class="relative z-[1] flex flex-1 flex-col items-center px-4 pb-2 pt-3 sm:mx-auto sm:w-full sm:max-w-2xl sm:px-6"
		>
			<div class="w-full max-w-[32rem] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/[0.06]">
				<div class="relative aspect-[3/2] w-full overflow-hidden">
					<img
						:src="CHECKIN_COMPLETE_STICKER_SRC"
						width="1024"
						height="682"
						:alt="t('checkinComplete.imageAlt')"
						class="absolute inset-0 h-full w-full object-cover object-center"
						loading="lazy"
						decoding="async"
					/>
				</div>
			</div>

			<h1 class="font-display mt-4 text-center text-[1.9rem] font-extrabold leading-tight text-[#2f7354]">
				{{ t("checkinComplete.title") }}
			</h1>
			<p class="mt-2 whitespace-pre-line text-center text-base font-semibold leading-relaxed text-[#2f7354]">
				{{ t("checkinComplete.subtitle") }}
			</p>

			<div
				class="mt-4 w-full max-w-[18rem] overflow-hidden rounded-xl border border-neutral-200/80 bg-white/85 shadow-sm ring-1 ring-black/[0.02]"
			>
				<div class="flex items-center justify-center gap-2.5 border-b border-neutral-200/70 px-6 py-3.5">
					<span class="inline-flex h-6 w-6 items-center justify-center text-[#2f7354]" aria-hidden="true">
						<svg class="block h-6 w-6" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 5h6"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="2"
							/>
							<rect
								x="4"
								y="6.5"
								width="16"
								height="13.5"
								rx="2"
								stroke="currentColor"
								stroke-width="2"
							/>
							<path
								d="M8.5 16a3.5 3.5 0 0 1 7 0"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-width="2"
							/>
							<circle
								cx="12"
								cy="11.5"
								r="2"
								stroke="currentColor"
								stroke-width="2"
							/>
						</svg>
					</span>
					<span class="text-lg font-bold text-gw-navy">{{
						t("checkinComplete.infoTitle")
					}}</span>
				</div>
				<ul class="divide-y divide-neutral-200/70 px-6">
					<li class="grid grid-cols-[5.5rem_1fr] items-center gap-3 py-3 text-lg">
						<span class="text-neutral-500">{{ t("checkin.form.name") }}</span>
						<span class="text-left font-bold text-gw-navy">{{ profile.name }}</span>
					</li>
					<li class="grid grid-cols-[5.5rem_1fr] items-center gap-3 py-3 text-lg">
						<span class="text-neutral-500">
							{{ t("checkin.form.employeeId") }}
						</span>
						<span class="text-left font-bold text-gw-navy">{{ profile.employeeId }}</span>
					</li>
					<li class="grid grid-cols-[5.5rem_1fr] items-center gap-3 py-3 text-lg">
						<span class="text-neutral-500">
							{{ t("checkin.form.companions") }}
						</span>
						<span class="text-left font-bold text-gw-navy">
							{{ companions }} {{ t("checkin.form.companionUnit") }}
						</span>
					</li>
				</ul>
			</div>

			<p class="mt-5 text-center text-xs text-neutral-400">
				{{ t("footer.copyright") }}
			</p>
		</main>

		<AppFooter class="relative z-[1]" />
	</div>
</template>
