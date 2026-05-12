<script setup lang="ts">
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
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
	<div class="relative flex min-h-full flex-col bg-[#e8eae7]">
		<GwBrandBar />

		<main
			class="relative z-[1] flex flex-1 flex-col px-4 pb-8 pt-4 sm:mx-auto sm:w-full sm:max-w-md sm:px-6"
		>
			<!-- 闖關 map 主視覺（截圖二：地圖優先） -->
			<div
				class="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white p-3 shadow-md ring-1 ring-black/[0.04]"
			>
				<img
					src="/images/game-board-map-flat-generated.png"
					width="1376"
					height="768"
					:alt="t('briefing.mapAlt')"
					class="block h-auto w-full rounded-xl"
					loading="eager"
					decoding="async"
				/>
				<p
					class="mt-3 text-center font-serif text-[10px] uppercase tracking-[0.2em] text-neutral-500"
				>
					{{ t("briefing.mapCaption") }}
				</p>
			</div>

			<h1
				class="font-display mt-6 text-center text-xl font-extrabold text-[#2f7354] sm:text-2xl"
			>
				{{ t("briefing.title") }}
			</h1>
			<p class="mt-3 text-center text-sm leading-relaxed text-neutral-700">
				{{ t("briefing.intro") }}
			</p>

			<div class="mt-5 flex flex-col gap-4">
				<section
					class="rounded-2xl border border-neutral-200/60 bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04]"
				>
					<h2 class="flex items-center gap-2 text-base font-bold text-[#2f7354]">
						<span class="text-lg leading-none" aria-hidden="true">🎁</span>
						{{ t("briefing.giftsTitle") }}
					</h2>
					<ul class="mt-3 space-y-2 text-sm leading-relaxed text-neutral-800">
						<li class="flex gap-2">
							<span
								class="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-700"
								aria-hidden="true"
							/>
							<span>{{ t("briefing.giftsBullet1") }}</span>
						</li>
						<li class="flex gap-2">
							<span
								class="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-700"
								aria-hidden="true"
							/>
							<span>{{ t("briefing.giftsBullet2") }}</span>
						</li>
					</ul>
				</section>
				<section
					class="rounded-2xl border border-neutral-200/60 bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.04]"
				>
					<h2 class="flex items-center gap-2 text-base font-bold text-[#2f7354]">
						<span class="text-lg leading-none" aria-hidden="true">📍</span>
						{{ t("briefing.locationsTitle") }}
					</h2>
					<ul class="mt-3 space-y-2 text-sm leading-relaxed text-neutral-800">
						<li class="flex gap-2">
							<span
								class="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-700"
								aria-hidden="true"
							/>
							<div>
								<p>{{ t("briefing.locationsExploreLead") }}</p>
								<p class="mt-1 text-neutral-800">
									{{ t("briefing.locationsList") }}
								</p>
							</div>
						</li>
						<li class="flex gap-2">
							<span
								class="mt-[0.4em] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-700"
								aria-hidden="true"
							/>
							<span>{{ t("briefing.locationsAnyOrder") }}</span>
						</li>
					</ul>
				</section>
			</div>

			<button
				type="button"
				class="gw-checkin-cta gw-checkin-cta--pill mt-8"
				@click="next"
			>
				{{ t("briefing.startButton") }}
			</button>
		</main>

		<AppFooter class="relative z-[1]" />
	</div>
</template>
