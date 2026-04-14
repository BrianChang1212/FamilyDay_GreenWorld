<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import StageMascot from "@/components/doodles/StageMascot.vue";
import { getInZone, getStage, setInZone, stageIds, stageTitle } from "@/lib/demoState";

const router = useRouter();
const stage = ref(1);
const inZone = ref(false);

onMounted(() => {
	stage.value = getStage();
	inZone.value = getInZone();
});

const stationLine = computed(() => `第 ${stage.value} 站 ${stageTitle(stage.value)}`);

function simulateScan() {
	inZone.value = true;
	setInZone(true);
}

function resetScanDemo() {
	inZone.value = false;
	setInZone(false);
}

function startQuiz() {
	router.push({ name: "quiz" });
}

function rowState(id: number): "done" | "current" | "locked" {
	if (id < stage.value) return "done";
	if (id === stage.value) return "current";
	return "locked";
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<PageCritters />
		<AppHeader class="relative z-[2]" :stage="stage" show-progress show-user />

		<main
			class="relative z-[2] flex flex-1 flex-col px-4 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))]"
		>
			<p
				class="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400"
			>
				請前往指定位置掃描 QR Code 解鎖任務
			</p>

			<section class="gw-surface mt-4 p-4">
				<div class="flex items-start justify-between gap-2">
					<div class="flex min-w-0 flex-1 items-start gap-3">
						<StageMascot :stage="stage" size="sm" />
						<div class="min-w-0">
							<h2 class="font-display text-base font-bold tracking-tight text-gw-navy">
								當前探索站點
							</h2>
							<p class="mt-1 text-xs leading-relaxed text-neutral-500">
								抵達現場後掃描站點 QR 以解鎖
							</p>
						</div>
					</div>
					<span
						v-if="!inZone"
						class="shrink-0 rounded-full bg-neutral-100/90 px-3 py-1.5 text-[10px] font-bold text-neutral-500 ring-1 ring-black/5"
					>
						等待掃描中
					</span>
					<span
						v-else
						class="shrink-0 rounded-full bg-gw-mint px-3 py-1.5 text-[10px] font-bold text-gw-brand-dark ring-1 ring-gw-brand/20"
					>
						任務已解鎖 ✓
					</span>
				</div>

				<div
					class="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gw-navy via-gw-navy-deep to-[#051018] px-4 pb-7 pt-9 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-black/20"
					style="
						background-image: radial-gradient(circle, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
							linear-gradient(180deg, rgba(26, 157, 74, 0.12) 0%, transparent 42%);
						background-size: 10px 10px, 100% 100%;
					"
				>
					<div
						class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"
						aria-hidden="true"
					/>
					<div class="relative text-4xl drop-shadow-md" aria-hidden="true">📷</div>
					<p class="relative mt-3 text-sm font-semibold text-white/95">到達地點了嗎？</p>
					<p class="relative mt-1 text-xs text-emerald-50/90">點擊下方按鈕啟動掃描（原型模擬）</p>

					<button
						v-if="!inZone"
						type="button"
						class="relative mt-6 gw-btn-on-dark"
						@click="simulateScan"
					>
						點此掃描 QR Code
					</button>
					<button
						v-else
						type="button"
						class="relative mt-6 gw-btn-primary-sm shadow-btn-lg"
						@click="startQuiz"
					>
						開始作答挑戰 ›
					</button>

					<p class="relative mt-7 text-left text-lg font-bold tracking-tight text-white">
						{{ stationLine }}
					</p>

					<button
						type="button"
						class="relative mt-3 text-[10px] font-medium text-emerald-100/85 underline decoration-emerald-200/40 underline-offset-2 transition hover:text-white"
						@click="resetScanDemo"
					>
						（測試用）重設掃描狀態
					</button>
				</div>
			</section>

			<section
				class="mt-4 flex gap-3 rounded-2xl bg-gradient-to-r from-gw-brand via-emerald-600 to-gw-forest-deep p-4 text-white shadow-[0_14px_36px_rgba(26,157,74,0.28)] ring-1 ring-white/20"
			>
				<span class="text-2xl opacity-95 drop-shadow-sm" aria-hidden="true">▦</span>
				<div>
					<h3 class="text-sm font-bold tracking-tight">如何解鎖任務？</h3>
					<p class="mt-1.5 text-xs leading-relaxed text-white/90">
						請在園區內找到標示「{{ stageTitle(stage) }}」的立牌，使用手機相機掃描 QR Code，即可解鎖該站任務。
					</p>
				</div>
			</section>

			<section class="gw-surface mt-5 p-4 pb-5">
				<h3 class="flex items-center gap-2 text-sm font-bold tracking-tight text-gw-navy">
					<span class="text-base" aria-hidden="true">✈️</span>
					闖關路線
				</h3>
				<ul class="mt-3.5 space-y-2">
					<li
						v-for="id in stageIds()"
						:key="id"
						:class="[
							'flex items-center gap-3 rounded-xl border px-3 py-3 transition-[transform,box-shadow,background-color,border-color] duration-300 ease-gw-out',
							rowState(id) === 'current'
								? 'border-gw-brand/45 bg-gw-mint/55 shadow-gw-soft ring-1 ring-gw-brand/15'
								: rowState(id) === 'done'
									? 'border-neutral-200/90 bg-gradient-to-r from-neutral-50 to-white hover:shadow-sm'
									: 'border-neutral-100/90 bg-white/70 opacity-75 hover:opacity-90',
						]"
					>
						<span
							:class="[
								'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm',
								rowState(id) === 'current'
									? 'bg-gw-cta text-white ring-1 ring-white/30'
									: rowState(id) === 'done'
										? 'bg-neutral-300 text-white'
										: 'bg-neutral-200 text-neutral-500',
							]"
							>{{ id }}</span
						>
						<div class="min-w-0 flex-1">
							<p class="truncate font-semibold text-gw-navy">{{ stageTitle(id) }}</p>
							<p class="text-[11px] text-neutral-500">
								<template v-if="rowState(id) === 'done'">任務完成</template>
								<template v-else-if="rowState(id) === 'current'">進行中</template>
								<template v-else>尚未解鎖</template>
							</p>
						</div>
						<StageMascot v-if="rowState(id) === 'current'" :stage="id" size="xs" class="opacity-90" />
						<span
							v-if="rowState(id) === 'current'"
							class="h-2 w-2 shrink-0 rounded-full bg-gw-brand shadow-glow-brand"
						/>
						<span v-else-if="rowState(id) === 'done'" class="font-bold text-gw-brand">✓</span>
					</li>
				</ul>
			</section>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
