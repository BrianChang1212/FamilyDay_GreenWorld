<script setup lang="ts">
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { resetScavengerRun } from "@/lib/demoState";

const router = useRouter();

const routeLine =
	"天鵝湖 → 大探奇區 → 水生植物公園 → 鳥園 → 蝴蝶園 → 生物多樣性探索區";

/** 對齊 §2.3：遊戲說明後下一屏一律為闖關登入（全屏表單），不直跳地圖 */
function next() {
	resetScavengerRun();
	router.push({ name: "register" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#fafaf8]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-8 pt-8 sm:mx-auto sm:max-w-md">
			<h1 class="font-display text-2xl font-bold text-gw-navy">遊戲說明</h1>
			<p class="mt-3 text-sm leading-relaxed text-neutral-800">
				歡迎來到家園探索之旅！跟隨地圖上的腳印，尋找 6 個神秘站點，完成挑戰領取限量勳章。
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
						alt="闖關路線示意：START 至 FINISH，沿途六個彩色站點與森林背景"
						class="block h-auto w-full max-w-full"
						loading="lazy"
						decoding="async"
					/>
				</div>
				<p class="mt-3 text-center font-serif text-xs italic text-neutral-500">ESTATE EXPLORATION MAP</p>
			</div>

			<ul class="mt-8 space-y-5">
				<li class="flex gap-3">
					<span class="text-lg" aria-hidden="true">📍</span>
					<div>
						<p class="font-bold text-gw-brand">闖關說明</p>
						<p class="mt-1 text-sm text-neutral-700">完成 6 大關卡挑戰，即可領取闖關禮。</p>
					</div>
				</li>
				<li class="flex gap-3">
					<span class="text-lg" aria-hidden="true">📍</span>
					<div>
						<p class="font-bold text-gw-brand">關卡地點</p>
						<p class="mt-1 text-sm leading-relaxed text-neutral-700">{{ routeLine }}</p>
					</div>
				</li>
			</ul>

			<div
				class="mt-8 rounded-2xl bg-neutral-100/90 px-4 py-4 ring-1 ring-black/[0.04]"
				role="region"
				aria-label="注意事項"
			>
				<p class="flex items-center gap-2 font-bold text-red-700">
					<span aria-hidden="true">⚠️</span>
					注意事項
				</p>
				<ul class="mt-3 list-inside list-disc space-y-1.5 text-sm text-neutral-800">
					<li>1 個員工編號最多登入 3 台裝置</li>
					<li>最多領取 3 份獎品</li>
				</ul>
			</div>

			<button
				type="button"
				class="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
				@click="next"
			>
				<span aria-hidden="true">🧭</span>
				開始探索
			</button>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
