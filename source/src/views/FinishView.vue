<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import {
	FINISH_REWARD_SLOTS,
	getFinishClaimedCount,
	getProfile,
	resetDemo,
	setFinishClaimedCount,
} from "@/lib/demoState";

const router = useRouter();

const profile = computed(() => getProfile());
const employeeDisplay = computed(() => {
	const id = profile.value.employeeId.trim();
	return id.length > 0 ? id : "—";
});

const claimedCount = ref(getFinishClaimedCount());

const totalSlots = FINISH_REWARD_SLOTS;
const remaining = computed(() => Math.max(0, totalSlots - claimedCount.value));

/** 即將領取的是第幾次（1-based） */
const pendingPrizeRound = computed(() => claimedCount.value + 1);

const showConfirm = ref(false);

function openConfirm() {
	if (remaining.value <= 0) return;
	showConfirm.value = true;
}

function closeConfirm() {
	showConfirm.value = false;
}

function confirmClaim() {
	if (remaining.value <= 0) {
		closeConfirm();
		return;
	}
	claimedCount.value += 1;
	setFinishClaimedCount(claimedCount.value);
	closeConfirm();
}

function goHome() {
	resetDemo();
	router.push({ name: "welcome" });
}

function slotClaimed(index: number): boolean {
	return index < claimedCount.value;
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<PageCritters />
		<main class="relative z-[2] flex flex-1 flex-col items-center px-4 pb-6 pt-8 sm:px-5">
			<h1
				class="font-display text-center text-[1.35rem] font-bold leading-tight tracking-tight text-gw-navy sm:text-2xl"
			>
				瑞軒家庭日 2026
			</h1>

			<div
				class="mt-4 flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-4 py-2.5 shadow-sm ring-1 ring-black/[0.03]"
			>
				<span class="text-sm font-medium text-neutral-600">工號</span>
				<span class="text-base font-bold tracking-wide text-sky-600">{{ employeeDisplay }}</span>
				<span
					class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]"
					aria-hidden="true"
				/>
			</div>

			<div
				class="relative mt-8 w-full max-w-[22rem] overflow-hidden rounded-[1.65rem] border border-neutral-200/80 bg-white px-5 pb-6 pt-8 shadow-card-lg ring-1 ring-white/90"
			>
				<p
					class="pointer-events-none absolute right-3 top-2 text-5xl leading-none opacity-[0.12] saturate-150"
					aria-hidden="true"
				>
					🐝
				</p>

				<div class="flex flex-col items-center text-center">
					<div
						class="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-emerald-100/90 shadow-inner ring-2 ring-white"
					>
						<span class="text-[2.75rem] leading-none drop-shadow-sm" aria-hidden="true">🏆</span>
					</div>
					<h2 class="font-display mt-5 text-[1.35rem] font-bold leading-snug text-gw-navy sm:text-2xl">
						闖關任務完成！
					</h2>
					<p class="mt-2 text-pretty text-sm font-medium leading-relaxed text-neutral-600">
						恭喜您獲得
						<span class="font-bold text-gw-navy">{{ totalSlots }}</span>
						次 保證領獎機會
					</p>
				</div>

				<div class="my-6 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

				<div class="grid grid-cols-3 gap-2 sm:gap-3">
					<div
						v-for="i in totalSlots"
						:key="i"
						class="flex flex-col items-center rounded-2xl border px-1.5 py-3 text-center transition-colors duration-200 sm:px-2"
						:class="
							slotClaimed(i - 1)
								? 'border-sky-300/90 bg-sky-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'
								: 'border-neutral-200/90 bg-neutral-50/50'
						"
					>
						<p
							class="text-[11px] font-semibold sm:text-xs"
							:class="slotClaimed(i - 1) ? 'text-sky-700' : 'text-neutral-400'"
						>
							第 {{ i }} 次
						</p>
						<span class="my-2 text-2xl sm:text-[1.75rem]" aria-hidden="true">
							{{ slotClaimed(i - 1) ? "🎁" : "🔒" }}
						</span>
						<p
							class="text-[11px] font-semibold sm:text-xs"
							:class="slotClaimed(i - 1) ? 'text-sky-700' : 'text-neutral-400'"
						>
							{{ slotClaimed(i - 1) ? "已領取" : "待領取" }}
						</p>
					</div>
				</div>

				<button
					type="button"
					class="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/60 bg-gradient-to-b from-[#fde047] to-[#facc15] py-3.5 text-base font-bold text-gw-navy shadow-[0_8px_24px_rgba(234,179,8,0.35)] transition-[filter,transform] duration-200 ease-gw-out enabled:hover:brightness-[1.03] enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
					:disabled="remaining <= 0"
					@click="openConfirm"
				>
					<span v-if="remaining > 0">點擊領取 (剩餘 {{ remaining }} 次)</span>
					<span v-else>已領取完畢</span>
					<span class="text-lg leading-none" aria-hidden="true">🎁</span>
				</button>
			</div>

			<p class="mt-4 max-w-sm text-center text-xs text-neutral-400">
				※ 請於工作人員面前點擊確認
			</p>

			<button
				type="button"
				class="mt-8 text-sm font-semibold text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-gw-brand"
				@click="goHome"
			>
				返回首頁
			</button>

			<p class="mt-6 text-center text-[11px] text-neutral-400">
				原型僅供操作體驗 · 資料未送出伺服器
			</p>
		</main>

		<AppFooter class="relative z-[2]" />

		<Teleport to="body">
			<div
				v-if="showConfirm"
				class="fixed inset-0 z-[100] flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="finish-confirm-title"
			>
				<button
					type="button"
					class="absolute inset-0 bg-gw-navy/55 backdrop-blur-[6px] transition-opacity"
					aria-label="關閉"
					@click="closeConfirm"
				/>
				<div
					class="relative z-[1] w-full max-w-[20rem] rounded-[1.35rem] bg-white px-6 pb-6 pt-8 text-center shadow-[0_24px_64px_rgba(15,31,46,0.22)] ring-1 ring-black/[0.04]"
				>
					<div class="text-5xl leading-none" aria-hidden="true">🎁</div>
					<h3 id="finish-confirm-title" class="font-display mt-4 text-xl font-bold text-gw-navy">
						確認領取？
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-neutral-500">
						您即將領取第
						<span class="font-bold text-sky-600">{{ pendingPrizeRound }}</span>
						次獎品。確認後無法取消喔！
					</p>
					<div class="mt-7 flex gap-3">
						<button
							type="button"
							class="flex-1 rounded-xl border border-neutral-200 bg-neutral-100 py-3 text-sm font-bold text-gw-navy transition hover:bg-neutral-200/90"
							@click="closeConfirm"
						>
							取消
						</button>
						<button
							type="button"
							class="flex-1 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(14,165,233,0.45)] ring-1 ring-white/20 transition hover:brightness-105 active:scale-[0.99]"
							@click="confirmClaim"
						>
							確定領取
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
