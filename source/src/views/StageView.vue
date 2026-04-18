<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import {
	QR_SCAN_STICKER_SRC,
	getInZone,
	getStage,
	setInZone,
	stageIds,
	stageStickerSrc,
	stageTitle,
} from "@/lib/demoState";

const router = useRouter();
const stage = ref(1);
const inZone = ref(false);

/** 到站畫面 vs 模擬掃碼全屏 */
const viewPhase = ref<"arrival" | "scanning">("arrival");

onMounted(() => {
	stage.value = getStage();
	inZone.value = getInZone();
});

const stationName = computed(() => stageTitle(stage.value));
const stationSticker = computed(() => stageStickerSrc(stage.value));

function simulateScan() {
	inZone.value = true;
	setInZone(true);
}

function startQuiz() {
	router.push({ name: "quiz" });
}

function openScanUi() {
	viewPhase.value = "scanning";
}

function closeScanUi() {
	viewPhase.value = "arrival";
}

function finishScanDemo() {
	simulateScan();
	viewPhase.value = "arrival";
}

function rowState(id: number): "done" | "current" | "locked" {
	if (id < stage.value) return "done";
	if (id === stage.value) return "current";
	return "locked";
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col bg-[#f5f6f4]">
		<AppHeader class="relative z-[2]" :stage="stage" show-progress show-user />

		<!-- —— 模擬掃碼全屏 —— -->
		<div
			v-if="viewPhase === 'scanning'"
			class="relative z-[2] flex flex-1 flex-col bg-gradient-to-b from-gw-mint/50 via-gw-cream to-[#eef5f0] px-5 pb-8 pt-10"
		>
			<div class="pointer-events-none absolute right-4 top-6 text-3xl opacity-25" aria-hidden="true">
				🍃
			</div>
			<h1 class="text-center text-lg font-bold text-gw-navy">請掃描 QR code</h1>
			<p class="mt-2 text-center font-serif text-xs text-neutral-600">
				將 QR 對準框線以解鎖站點（原型示意）
			</p>

			<div class="relative mx-auto mt-8 w-full max-w-[18rem]">
				<div
					class="overflow-hidden rounded-2xl border border-gw-mint-soft/90 bg-white/90 shadow-card ring-1 ring-black/[0.06]"
				>
					<img
						:src="QR_SCAN_STICKER_SRC"
						width="1024"
						height="1024"
						alt="掃描 QR code：簡潔取景框與掃描線示意"
						class="aspect-square h-auto w-full object-cover object-center"
						loading="lazy"
						decoding="async"
					/>
				</div>
			</div>

			<div class="mt-auto flex flex-col gap-3 pt-8">
				<button
					type="button"
					class="w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110"
					@click="finishScanDemo"
				>
					模擬掃描成功
				</button>
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-full border-2 border-gw-brand/35 bg-white py-3.5 text-base font-semibold text-gw-navy shadow-sm transition hover:bg-gw-mint/30"
					@click="closeScanUi"
				>
					<span aria-hidden="true">←</span>
					返回
				</button>
			</div>
			<p class="mt-6 text-center font-serif text-[10px] uppercase tracking-[0.2em] text-neutral-400">
				The Living Journal · prototype
			</p>
		</div>

		<!-- —— 到站／路線 —— -->
		<main
			v-else
			class="relative z-[2] flex flex-1 flex-col px-4 pb-6 pt-4"
		>
			<!-- 到站卡片（未解鎖時） -->
			<div
				v-if="!inZone"
				class="flex flex-1 flex-col items-center px-1"
			>
				<div
					class="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/90 bg-white shadow-md ring-1 ring-black/[0.04]"
				>
					<div class="px-5 pb-3 pt-5">
						<p class="text-center text-xs font-bold tracking-wide text-gw-navy">SCAVENGER HUNT</p>
						<p class="text-center text-[10px] font-medium uppercase tracking-wider text-neutral-500">
							IN-ZONE NAVIGATION
						</p>
					</div>
					<!-- 貼圖區：左右貼齊白卡，依圖檔比例完整顯示（不裁切 START／構圖邊緣） -->
					<div
						class="border-t border-neutral-200/80 bg-gw-mint/10 ring-1 ring-inset ring-neutral-300/55"
					>
						<div class="w-full overflow-hidden">
							<img
								:src="stationSticker"
								width="1024"
								height="1024"
								:alt="`${stationName} 關卡貼圖`"
								class="block h-auto w-full max-w-full"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>
				</div>

				<p class="mt-8 text-sm text-neutral-800">請前往第 {{ stage }} 關</p>
				<p class="font-display mt-2 text-3xl font-bold text-gw-brand">{{ stationName }}</p>
				<p class="mt-2 text-center text-sm text-neutral-600">抵達後，點擊掃描模擬相機</p>

				<button
					type="button"
					class="mt-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gw-brand text-2xl text-white shadow-[0_12px_32px_rgba(26,157,74,0.45)] transition hover:brightness-110 active:scale-95"
					aria-label="開啟掃碼（模擬）"
					@click="openScanUi"
				>
					📷
				</button>
			</div>

			<!-- 已掃碼：開始作答 -->
			<div v-else class="flex flex-col items-center px-2 pt-4">
				<div
					class="w-full max-w-md rounded-3xl border border-gw-mint-soft bg-gw-mint/40 px-5 py-6 text-center ring-1 ring-gw-brand/10"
				>
					<img
						:src="stationSticker"
						width="1024"
						height="768"
						:alt="`${stationName} 關卡貼圖`"
						class="mx-auto h-24 w-full max-w-[12rem] rounded-2xl border border-white/80 bg-white object-contain object-center shadow-sm"
						loading="lazy"
						decoding="async"
					/>
					<p class="mt-4 text-sm font-semibold text-gw-navy">任務已解鎖</p>
					<p class="mt-1 text-lg font-bold text-gw-brand">{{ stationName }}</p>
					<button
						type="button"
						class="mt-6 w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110"
						@click="startQuiz"
					>
						開始作答挑戰 →
					</button>
				</div>
			</div>

			<section class="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
				<h3 class="text-sm font-bold text-gw-navy">闖關路線</h3>
				<ul class="mt-3 space-y-2">
					<li
						v-for="id in stageIds()"
						:key="id"
						:class="[
							'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm',
							rowState(id) === 'current'
								? 'border-gw-brand/40 bg-gw-mint/30'
								: rowState(id) === 'done'
									? 'border-neutral-200 bg-neutral-50'
									: 'border-neutral-100 bg-white/80 opacity-70',
						]"
					>
						<span
							:class="[
								'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
								rowState(id) === 'current'
									? 'bg-gw-brand text-white'
									: rowState(id) === 'done'
										? 'bg-neutral-300 text-white'
										: 'bg-neutral-200 text-neutral-500',
							]"
							>{{ id }}</span
						>
						<img
							:src="stageStickerSrc(id)"
							width="80"
							height="80"
							:alt="`${stageTitle(id)} 貼圖`"
							class="h-10 w-10 shrink-0 rounded-xl border border-neutral-200/80 bg-neutral-50 object-contain object-center shadow-sm"
							loading="lazy"
						/>
						<span class="min-w-0 flex-1 truncate font-semibold text-gw-navy">{{
							stageTitle(id)
						}}</span>
						<span v-if="rowState(id) === 'done'" class="text-gw-brand">✓</span>
					</li>
				</ul>
			</section>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
