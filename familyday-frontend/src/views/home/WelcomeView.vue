<script setup lang="ts">
import { useRouter } from "vue-router";
import { resetScavengerRun } from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();

function next() {
	resetScavengerRun();
	router.push({ name: "briefing" });
}
</script>

<template>
	<!--
		闖關歡迎頁：滿版叢林背景圖（game-welcome-enroll-04.jpg）；
		familyday-logotype 自頂置中；底部「開始闖關」CTA。
	-->
	<div
		class="box-border flex h-full max-h-full min-h-dvh w-full flex-col overflow-hidden bg-[#2B5038]"
	>
		<div class="relative min-h-0 flex-1 overflow-hidden">
			<img
				src="/images/game-welcome-enroll-04.jpg"
				:alt="t('welcome.backgroundAlt')"
				class="absolute inset-0 h-full w-full object-cover object-center"
				loading="eager"
				fetchpriority="high"
			/>
			<div
				class="welcome-hero-logotype-wrap pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-2 sm:px-4"
			>
				<img
					src="/images/familyday-logotype.png"
					width="1232"
					height="489"
					:alt="t('welcome.heroAlt')"
					class="welcome-hero-logotype"
					loading="eager"
					fetchpriority="high"
				/>
			</div>
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-6 pt-12"
			>
				<button
					type="button"
					class="gw-checkin-cta pointer-events-auto"
					@click="next"
				>
					{{ t("welcome.startButton") }}
					<span
						class="text-3xl leading-none"
						aria-hidden="true"
					>›</span>
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.welcome-hero-logotype-wrap {
	padding-top: clamp(2.25rem, 11vmin, 5.75rem);
}

.welcome-hero-logotype {
	width: min(100% - 1rem, 36rem);
	height: auto;
	max-height: clamp(7.5rem, 28vmin, 13rem);
	object-fit: contain;
	object-position: center top;
	filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.4));
}
</style>
