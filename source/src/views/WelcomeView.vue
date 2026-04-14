<script setup lang="ts">
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import WelcomeForestDecor from "@/components/doodles/WelcomeForestDecor.vue";
import WelcomeHeroForest from "@/components/doodles/WelcomeHeroForest.vue";

const router = useRouter();

function next() {
	router.push({ name: "briefing" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col overflow-hidden bg-white">
		<WelcomeForestDecor />
		<AppHeader class="relative z-[2]" :show-progress="false" :show-user="false" />

		<main class="relative z-[2] flex flex-1 flex-col px-5 pb-4 pt-2">
			<div class="text-center">
				<span
					class="gw-cover-in inline-block rounded-full border border-gw-mint-soft bg-gw-mint/80 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-gw-brand-dark"
					style="--gw-d: 70ms"
				>
					WELCOME TO 2026
				</span>
				<h1
					class="gw-cover-in font-display mt-6 text-[1.85rem] font-bold leading-snug tracking-tight text-gw-navy sm:text-[2.1rem]"
					style="--gw-d: 140ms"
				>
					瑞軒家庭日
				</h1>
				<p
					class="gw-cover-in relative mt-3 inline-block text-lg font-bold text-gw-brand sm:text-xl"
					style="--gw-d: 210ms"
				>
					探索自然之美
					<span
						class="gw-cover-line absolute -bottom-1 left-0 right-0 mx-auto h-1 w-[7rem] rounded-full bg-gw-mint-soft"
					/>
				</p>
				<p
					class="gw-cover-in mx-auto mt-6 max-w-sm text-sm leading-relaxed text-neutral-500"
					style="--gw-d: 290ms"
				>
					與家人一同走入自然，翻開屬於我們的生活日誌，寫下美好的回憶篇章。
				</p>
			</div>

			<div class="mt-8">
				<button
					type="button"
					class="gw-cover-in w-full rounded-2xl bg-gw-brand py-4 text-base font-bold text-white shadow-btn transition duration-300 ease-out hover:brightness-[1.03] hover:shadow-[0_6px_20px_rgba(26,157,74,0.35)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gw-brand"
					style="--gw-d: 360ms"
					@click="next"
				>
					開始探索 →
				</button>
			</div>

			<div
				class="gw-cover-in gw-cover-in--hero gw-cover-feature-card relative mt-8 rounded-3xl border border-gw-mint-soft bg-gradient-to-br from-gw-mint/50 to-white px-4 py-4 sm:px-5 sm:py-5"
				style="--gw-d: 460ms"
			>
				<!-- 插圖區角落小裝飾：手繪蘑菇與小花 -->
				<svg
					class="pointer-events-none absolute -left-1 bottom-8 z-[1] h-10 w-10 text-[#2d6a4f] opacity-50"
					viewBox="0 0 40 40"
					fill="none"
					aria-hidden="true"
				>
					<path stroke="#8b4513" stroke-width="1.8" stroke-linecap="round" d="M20 18v14" />
					<path
						fill="#f4a261"
						stroke="#e76f51"
						stroke-width="1.5"
						d="M20 8c-8 0-12 8-8 12 4 4 12 4 16 0 4-4 0-12-8-12z"
					/>
				</svg>
				<svg
					class="pointer-events-none absolute -right-1 top-6 z-[1] h-9 w-9 rotate-6 text-[#e9c46a] opacity-55"
					viewBox="0 0 36 36"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="18" cy="18" r="5" fill="#fef3c7" stroke="#d4a373" stroke-width="1.5" />
					<path
						stroke="#fbbf24"
						stroke-width="1.5"
						stroke-linecap="round"
						d="M18 8v4M18 24v4M8 18h4M24 18h4M11 11l3 3M22 22l3 3M25 11l-3 3M14 22l-3 3"
					/>
				</svg>
				<div
					class="relative z-[1] w-full overflow-hidden rounded-2xl border border-sky-100/80 bg-sky-50/40 shadow-inner ring-1 ring-white/60"
				>
					<WelcomeHeroForest class="block w-full min-w-0" />
				</div>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
