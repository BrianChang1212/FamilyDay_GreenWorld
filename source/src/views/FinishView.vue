<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import StageMascot from "@/components/doodles/StageMascot.vue";
import { getProfile, resetDemo } from "@/lib/demoState";

const router = useRouter();
const profile = computed(() => getProfile());

function again() {
	resetDemo();
	router.push({ name: "welcome" });
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<PageCritters />
		<AppHeader class="relative z-[2]" :stage="6" :completed-override="6" show-progress show-user />

		<main class="relative z-[2] flex flex-1 flex-col items-center px-5 pb-8 pt-6">
			<StageMascot :stage="6" size="lg" class="mb-2 drop-shadow-md" />
			<div class="relative w-full max-w-[300px]">
				<div
					class="gw-surface-elevated rounded-[1.65rem] border-gw-mint/40 bg-gradient-to-b from-gw-mint/45 via-white to-white p-6 shadow-card-lg"
				>
					<div
						class="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border border-sky-100/80 bg-gradient-to-b from-sky-50/95 to-gw-mint/25 shadow-inner ring-1 ring-white/80"
					>
						<div
							class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/35 blur-2xl"
							aria-hidden="true"
						/>
						<div class="absolute right-6 top-6 h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-md ring-2 ring-white/80" />
						<div class="flex items-end gap-1 drop-shadow-sm">
							<div class="h-10 w-2 rounded-t bg-emerald-600" />
							<div class="h-14 w-2 rounded-t bg-emerald-500" />
							<div class="h-8 w-2 rounded-t bg-teal-600" />
						</div>
					</div>
				</div>
				<div
					class="absolute -bottom-2 right-4 rotate-[-8deg] rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-300 to-amber-400 px-4 py-2 text-center text-xs font-bold text-gw-navy shadow-[0_12px_28px_rgba(15,31,46,0.12)] ring-2 ring-white/90"
				>
					<span class="block tracking-wide">🏆 闖關完成</span>
					<span class="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gw-navy/75"
						>Mission clear</span
					>
				</div>
			</div>

			<h1
				class="font-display mt-14 text-balance bg-gradient-to-br from-gw-navy to-gw-navy-deep bg-clip-text text-center text-[1.65rem] font-bold leading-snug tracking-tight text-transparent sm:text-2xl"
			>
				六站完成，探索告一段落
			</h1>
			<p class="mt-3 max-w-sm text-center text-pretty text-sm font-medium leading-relaxed text-neutral-600">
				請憑完成紀錄至終點服務台領取闖關禮；若有疑問可洽現場工作人員。
			</p>

			<div class="mt-10 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="gw-surface p-4 ring-gw-mint/20">
					<p class="gw-eyebrow">探索勇者</p>
					<p class="mt-1 truncate text-lg font-bold text-gw-navy">
						{{ profile.name || "—" }}
					</p>
				</div>
				<div class="gw-surface p-4 ring-gw-mint/20">
					<p class="gw-eyebrow">員工編號</p>
					<p class="mt-1 truncate text-lg font-bold text-gw-navy">
						{{ profile.employeeId || "—" }}
					</p>
				</div>
			</div>

			<button type="button" class="mt-10 w-full max-w-sm gw-btn-primary gw-btn-primary--pill" @click="again">
				返回首頁
			</button>

			<p class="mt-6 text-center text-[11px] text-neutral-400">
				原型僅供操作體驗 · 資料未送出伺服器
			</p>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
