<script setup lang="ts">
import { useRouter } from "vue-router";
import { APP_CONFIG } from "@/constants";
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
		與報到歡迎頁 CheckInWelcomeView 同款：插圖滿铺 flex-1；標語疊頂；CTA 疊底。
	-->
	<div
		class="box-border flex h-full max-h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-[#2B5038]"
	>
		<div class="relative min-h-0 flex-1 overflow-hidden">
			<picture class="contents">
				<source
					media="(min-width: 640px)"
					srcset="/images/enroll-welcome-alpaca-adventure-wide-headroom.png"
				/>
				<img
					src="/images/enroll-welcome-alpaca-adventure-wide-headroom.png"
					:alt="t('welcome.heroAlt')"
					class="absolute inset-0 h-full w-full object-cover object-center"
					loading="eager"
					fetchpriority="high"
				/>
			</picture>
			<div
				class="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-2 pt-5 sm:px-4 sm:pt-6"
			>
				<div class="welcome-hero-slogan">
					<p class="welcome-hero-line1">
						{{ APP_CONFIG.YEAR }} 瑞軒科技家庭日
					</p>
					<p class="welcome-hero-line2">視野無界，綠動未來</p>
					<p class="welcome-hero-line3">AmTRAN Go Wild</p>
				</div>
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
/*
 * 與 CheckInWelcomeView 一致：三行共用 vmin + clamp
 */
.welcome-hero-slogan {
	display: flex;
	width: 100%;
	max-width: min(100%, 36rem);
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: clamp(13rem, 48vmin, 22rem);
	padding-bottom: min(2vmin, 0.75rem);
	gap: clamp(0.15rem, 1.2vmin, 0.55rem);
	text-align: center;
	filter: drop-shadow(0 0 10px rgba(15, 40, 25, 0.28));
}

.welcome-hero-line1 {
	margin: 0;
	max-width: 100%;
	padding: 0 0.25rem;
	font-size: clamp(1.45rem, 7.2vmin, 2.47rem);
	font-weight: 800;
	line-height: 1.15;
	color: #fff;
	letter-spacing: 0.04em;
	text-align: center;
	-webkit-text-stroke: 1.2px #0a0a0a;
	paint-order: stroke fill;
	text-shadow:
		1px 0 0 #0a0a0a,
		-1px 0 0 #0a0a0a,
		0 1px 0 #0a0a0a,
		0 -1px 0 #0a0a0a,
		0 2px 0 rgba(0, 0, 0, 0.35),
		0 3px 10px rgba(0, 0, 0, 0.4);
}

.welcome-hero-line2,
.welcome-hero-line3 {
	margin: 0;
	max-width: 100%;
	font-weight: 800;
	line-height: 1.12;
	letter-spacing: 0.02em;
	color: #ff8a3c;
	-webkit-text-stroke: 1.75px #1a0f08;
	paint-order: stroke fill;
	text-shadow:
		2px 2px 0 rgba(0, 0, 0, 0.34),
		0 3px 6px rgba(0, 0, 0, 0.4);
}

.welcome-hero-line2 {
	font-size: clamp(1.85rem, 9.2vmin, 3.15rem);
}

.welcome-hero-line3 {
	font-size: clamp(2.05rem, 10.5vmin, 3.55rem);
	font-family: ui-sans-serif, system-ui, sans-serif;
	letter-spacing: 0.04em;
	text-transform: none;
}
</style>
