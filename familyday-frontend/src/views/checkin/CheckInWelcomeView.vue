<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import {
	clearCheckinWelcomePassed,
	setCheckinWelcomePassed,
} from "@/lib/entryIntent";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();

onMounted(() => {
	clearCheckinWelcomePassed();
});

function next() {
	setCheckinWelcomePassed(true);
	router.push({ name: "checkin" });
}
</script>

<template>
	<!--
		插圖铺满；Logotype 自頂留白後置中（對齊截圖與主視覺距離）；CTA 疊底。
	-->
	<div
		class="box-border flex h-full max-h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-[#2B5038]"
	>
		<div class="relative min-h-0 flex-1 overflow-hidden">
			<img
				src="/images/checkin-welcome-bg.jpg"
				alt="瑞軒科技2026家庭日報到歡迎畫面"
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
					開始探索
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
