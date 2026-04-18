<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import { getProfile, isCheckInDone } from "@/lib/demoState";

const router = useRouter();
const profile = computed(() => getProfile());

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
	<div class="relative flex min-h-full flex-col overflow-hidden bg-white">
		<div class="pointer-events-none absolute inset-0 z-0 opacity-[0.9]" aria-hidden="true">
			<PageCritters variant="inline" />
		</div>

		<AppHeader class="relative z-[2]" :show-progress="false" :show-user="false" />

		<main class="relative z-[2] flex flex-1 flex-col px-5 pb-8 pt-4">
			<div
				class="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center"
			>
				<div
					class="flex h-20 w-20 items-center justify-center rounded-full bg-gw-mint/50 text-4xl shadow-[0_8px_32px_rgba(26,157,74,0.2)] ring-4 ring-gw-mint-soft/60"
					aria-hidden="true"
				>
					✓
				</div>
				<p class="gw-eyebrow mt-8 text-gw-brand">CHECK-IN</p>
				<h1 class="font-display mt-2 text-[1.65rem] font-bold leading-snug text-gw-navy sm:text-[1.85rem]">
					報到完成
				</h1>
				<p class="mt-4 max-w-sm text-pretty text-sm font-medium leading-relaxed text-neutral-600">
					<span class="font-semibold text-gw-navy">{{ profile.name }}</span>
					<span class="text-neutral-500">（{{ profile.employeeId }}）資料已送出。</span>
				</p>
				<p class="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-neutral-600">
					請依現場工作人員引導領取<strong class="font-semibold text-gw-navy">報到禮</strong>。
				</p>
				<div
					class="mt-8 w-full max-w-sm rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-4 text-left text-sm leading-relaxed text-amber-950/90 shadow-sm ring-1 ring-amber-100/80"
					role="status"
				>
					<p class="font-semibold text-gw-navy">若要參加闖關</p>
					<p class="mt-2 text-neutral-700">
						請另外掃描現場的<strong class="text-gw-navy">闖關專用 QR Code</strong>進入；本頁不會帶您進入闖關。
					</p>
				</div>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
