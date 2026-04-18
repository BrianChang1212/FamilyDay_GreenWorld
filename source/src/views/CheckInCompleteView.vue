<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import {
	CHECKIN_COMPLETE_STICKER_SRC,
	getCompanionCount,
	getProfile,
	isCheckInDone,
} from "@/lib/demoState";

const router = useRouter();
const profile = computed(() => getProfile());
const companions = computed(() => getCompanionCount());

onMounted(() => {
	const { name, employeeId } = profile.value;
	if (!name.trim() || !employeeId.trim()) {
		router.replace({ name: "checkin" });
		return;
	}
	if (!isCheckInDone()) {
		router.replace({ name: "checkin" });
	}
});
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f7f8f6]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-8 pt-8 sm:mx-auto sm:max-w-md">
			<!-- 插圖佔位（稍後替換為正式素材） -->
			<div
				class="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-md ring-1 ring-black/[0.04]"
			>
				<div class="bg-gradient-to-b from-gw-mint/40 to-white px-4 pb-3 pt-6 text-center">
					<p class="text-xs font-bold tracking-wide text-gw-navy/80">YOU&apos;RE ALL SET!</p>
					<p class="mt-1 text-[11px] text-neutral-600">Family Day Event Registration Complete!</p>
				</div>
				<div class="border-t border-neutral-200/80 bg-gw-mint/10 ring-1 ring-inset ring-neutral-300/50">
					<div class="relative aspect-[5/4] w-full overflow-hidden">
						<img
							:src="CHECKIN_COMPLETE_STICKER_SRC"
							width="1024"
							height="1024"
							alt="完成報到：自然慶祝場景（無人物）"
							class="absolute inset-0 h-full w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					</div>
				</div>
				<div class="flex justify-center bg-white px-4 pb-5 pt-4">
					<button
						type="button"
						class="rounded-full bg-gw-brand px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white opacity-90"
						disabled
					>
						VIEW DETAILS
					</button>
				</div>
			</div>

			<h1 class="font-display mt-8 text-center text-2xl font-bold text-gw-brand">恭喜完成報到</h1>
			<p class="mt-2 text-center text-sm font-medium text-gw-navy">
				感謝參加瑞軒科技2026家庭日
			</p>

			<div
				class="mt-8 overflow-hidden rounded-3xl border border-neutral-200/90 bg-[#f0f2ee] shadow-sm ring-1 ring-black/[0.03]"
			>
				<div class="flex items-center justify-between border-b border-neutral-200/80 px-4 py-3">
					<div class="flex items-center gap-2">
						<span class="flex h-6 w-6 items-center justify-center rounded bg-gw-brand text-xs text-white">✓</span>
						<span class="text-sm font-bold text-gw-navy">報到資訊</span>
					</div>
					<span
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gw-mint/80 text-sm text-gw-brand"
						aria-hidden="true"
						>✓</span
					>
				</div>
				<ul class="divide-y divide-neutral-200/70 px-2 py-1">
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>👤</span
						>
						<div>
							<p class="text-xs text-neutral-500">姓名</p>
							<p class="font-bold text-gw-navy">{{ profile.name }}</p>
						</div>
					</li>
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>🪪</span
						>
						<div>
							<p class="text-xs text-neutral-500">員工編號</p>
							<p class="font-bold text-gw-navy">{{ profile.employeeId }}</p>
						</div>
					</li>
					<li class="flex items-center gap-3 px-3 py-4">
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gw-brand shadow-sm ring-1 ring-black/[0.04]"
							aria-hidden="true"
							>👥</span
						>
						<div>
							<p class="text-xs text-neutral-500">同行人數</p>
							<p class="font-bold text-gw-navy">{{ companions }} 位</p>
						</div>
					</li>
				</ul>
			</div>

			<div
				class="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-4 text-left text-sm text-amber-950/90"
				role="status"
			>
				<p class="font-semibold text-gw-navy">領取報到禮</p>
				<p class="mt-2 text-neutral-700">
					請依現場工作人員引導領取<strong class="text-gw-navy">報到禮</strong>。
				</p>
				<p class="mt-3 text-neutral-700">
					參加闖關請另掃<strong class="text-gw-navy">闖關專用 QR</strong>，本頁不會進入闖關。
				</p>
			</div>

			<p class="mt-8 text-center text-xs text-neutral-400">© 2026 AmTRAN Technology Co., Ltd.</p>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
