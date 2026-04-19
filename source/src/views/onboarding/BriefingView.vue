<script setup lang="ts">
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { resetScavengerRun } from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();

/** 對齊 §2.3：遊戲說明後下一屏一律為闖關登入（全屏表單），不直跳地圖 */
function next() {
	resetScavengerRun();
	router.push({ name: "register" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#fafaf8]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-8 pt-8 sm:mx-auto sm:max-w-md">
			<h1 class="font-display text-2xl font-bold text-gw-navy">
				{{ t("briefing.title") }}
			</h1>
			<p class="mt-3 text-sm leading-relaxed text-neutral-800">
				{{ t("briefing.intro") }}
			</p>

			<div
				class="mt-6 overflow-hidden rounded-3xl border border-neutral-200/90 bg-white p-3 shadow-sm ring-1 ring-black/[0.03]"
			>
				<div
					class="overflow-hidden rounded-2xl border border-gw-brand/10 bg-[#faf8f3] ring-1 ring-black/[0.04]"
				>
					<img
						src="/images/game-instructions-map.png"
						width="1200"
						height="800"
						:alt="t('briefing.mapAlt')"
						class="block h-auto w-full max-w-full"
						loading="lazy"
						decoding="async"
					/>
				</div>
				<p class="mt-3 text-center font-serif text-xs italic text-neutral-500">
					{{ t("briefing.mapCaption") }}
				</p>
			</div>

			<ul class="mt-8 space-y-5">
				<li class="flex gap-3">
					<span class="text-lg" aria-hidden="true">📍</span>
					<div>
						<p class="font-bold text-gw-brand">{{ t("briefing.missionTitle") }}</p>
						<p class="mt-1 text-sm text-neutral-700">{{ t("briefing.missionText") }}</p>
					</div>
				</li>
				<li class="flex gap-3">
					<span class="text-lg" aria-hidden="true">📍</span>
					<div>
						<p class="font-bold text-gw-brand">{{ t("briefing.locationsTitle") }}</p>
						<p class="mt-1 text-sm leading-relaxed text-neutral-700">
							{{ t("briefing.routeLine") }}
						</p>
					</div>
				</li>
			</ul>

			<div
				class="mt-8 rounded-2xl bg-neutral-100/90 px-4 py-4 ring-1 ring-black/[0.04]"
				role="region"
				:aria-label="t('briefing.noticeAriaLabel')"
			>
				<p class="flex items-center gap-2 font-bold text-red-700">
					<span aria-hidden="true">⚠️</span>
					{{ t("briefing.noticeTitle") }}
				</p>
				<ul class="mt-3 list-inside list-disc space-y-1.5 text-sm text-neutral-800">
					<li>{{ t("briefing.noticeRuleDevices") }}</li>
					<li>{{ t("briefing.noticeRuleRewards") }}</li>
				</ul>
			</div>

			<button
				type="button"
				class="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
				@click="next"
			>
				<span aria-hidden="true">🧭</span>
				{{ t("briefing.startButton") }}
			</button>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
