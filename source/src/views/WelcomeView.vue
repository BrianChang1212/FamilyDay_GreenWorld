<script setup lang="ts">
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { resetScavengerRun } from "@/lib/demoState";

const router = useRouter();

function next() {
	resetScavengerRun();
	router.push({ name: "briefing" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f0f9f4]">
		<main
			class="relative z-[1] flex flex-1 flex-col px-4 pb-5 pt-3 sm:mx-auto sm:max-w-xl sm:px-6 sm:pb-6 sm:pt-5"
		>
			<!-- 手機：左右出血加寬圖；sm+：維持圓角卡 -->
			<div
				class="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden border-y border-gw-mint-soft/70 bg-white shadow-[0_8px_24px_rgba(15,31,46,0.06)] sm:mx-0 sm:w-full sm:rounded-3xl sm:border sm:border-gw-mint-soft/80 sm:shadow-md sm:ring-1 sm:ring-black/[0.04]"
			>
				<img
					src="/images/family-day-forest-walk.png"
					width="1024"
					height="1024"
					alt="一家四口在陽光森林步道上手牽手散步，歡迎來到瑞軒家庭日"
					class="aspect-[5/4] h-auto min-h-[13.5rem] w-full object-cover object-[center_36%] sm:aspect-[16/10] sm:min-h-[17rem]"
					loading="eager"
					decoding="async"
					fetchpriority="high"
				/>
			</div>

			<div class="mt-4 text-center sm:mt-5">
				<h1 class="font-display text-2xl font-bold text-gw-navy sm:text-[1.75rem]">歡迎來到2026</h1>
				<p class="font-display mt-1.5 text-xl font-bold italic text-gw-brand">瑞軒家庭日</p>
				<p class="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-neutral-600 sm:mt-4">
					與家人一同走入自然，翻開屬於我們的生活日誌，寫下美好的回憶篇章。
				</p>
			</div>

			<div class="mt-5 sm:mt-6">
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-full bg-gw-brand py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(26,157,74,0.35)] transition hover:brightness-105 active:scale-[0.99]"
					@click="next"
				>
					開始探索
					<span aria-hidden="true">→</span>
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
