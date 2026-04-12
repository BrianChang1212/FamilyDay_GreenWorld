<script setup lang="ts">
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import BriefingAnimalsDecor from "@/components/doodles/BriefingAnimalsDecor.vue";

const router = useRouter();

const steps = [
	"在站點立牌上找到 QR Code。",
	"開啟相機掃描並解鎖該站任務。",
	"正確回答該區生態題目。",
	"完成 6 站後可至終點兌換闖關禮。",
];

function next() {
	router.push({ name: "register" });
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<AppHeader class="relative z-[2]" :show-progress="false" :show-user="false" />

		<main class="relative z-[2] flex flex-1 flex-col gap-0 px-0 pb-4">
			<section
				class="relative overflow-hidden bg-gradient-to-br from-gw-brand via-emerald-600 to-gw-forest-deep px-5 pb-9 pt-7 text-white shadow-[0_12px_40px_rgba(26,157,74,0.22)]"
			>
				<div
					class="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/12 blur-3xl"
					aria-hidden="true"
				/>
				<div
					class="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-[120%] -translate-x-1/2 bg-gradient-to-t from-black/10 to-transparent"
					aria-hidden="true"
				/>
				<p class="gw-eyebrow text-white/70">GUIDE</p>
				<h1 class="mt-2 text-2xl font-bold tracking-tight">遊戲說明</h1>
				<p class="mt-3 text-sm leading-relaxed text-white/92">
					歡迎參加家園探索之旅！請至各站掃描 QR Code 解鎖任務，依序完成生態小挑戰。
				</p>
				<ul class="mt-7 space-y-2.5">
					<li v-for="(t, i) in steps" :key="i" class="flex gap-3 text-sm leading-snug">
						<span
							class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/18 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur-sm"
							>{{ i + 1 }}</span
						>
						<span class="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm">{{
							t
						}}</span>
					</li>
				</ul>
			</section>

			<section class="relative flex min-h-[min(52dvh,420px)] flex-1 flex-col px-5 pb-6 pt-9">
				<BriefingAnimalsDecor />

				<div class="relative z-10 flex flex-1 flex-col items-center justify-center py-4">
					<div
						class="relative flex aspect-square w-full max-w-[232px] items-center justify-center rounded-full border-2 border-dashed border-gw-brand/35 bg-white/95 p-1.5 shadow-card-sm ring-4 ring-gw-mint/35 backdrop-blur-sm"
					>
						<div
							class="flex h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-2xl border border-neutral-200/90 bg-gradient-to-b from-white to-gw-sand/50 shadow-inner ring-1 ring-white/80"
						>
							<span class="text-4xl text-gw-navy/35" aria-hidden="true">▦</span>
							<p class="gw-eyebrow mt-2 text-center text-neutral-600">SCAN TO UNLOCK MISSION</p>
						</div>
						<button
							type="button"
							class="absolute -right-0.5 -top-0.5 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-gw-cta text-lg text-white shadow-btn-lg ring-2 ring-white/90 transition hover:brightness-105 active:scale-95"
							aria-label="相機"
							@click.prevent
						>
							📷
						</button>
					</div>
				</div>

				<button type="button" class="relative z-10 mt-10 gw-btn-navy" @click="next">
					進入闖關地圖
				</button>
			</section>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
