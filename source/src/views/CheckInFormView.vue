<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import {
	getCompanionCount,
	getProfile,
	isCheckInDone,
	setCheckInDone,
	setCompanionCount,
	setProfile,
} from "@/lib/demoState";
import { clearEntryIntent } from "@/lib/entryIntent";

const router = useRouter();

const p0 = getProfile();
const name = ref(p0.name);
const employeeId = ref(p0.employeeId);
const companionCount = ref(getCompanionCount());
const showConfirm = ref(false);

const inputClass =
	"w-full rounded-2xl border border-white/90 bg-white/92 px-4 py-3.5 text-base text-gw-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_20px_rgba(26,157,74,0.06)] outline-none ring-1 ring-gw-mint-soft/40 transition-[border-color,box-shadow,ring-color] placeholder:text-neutral-400 focus:border-gw-brand/80 focus:ring-4 focus:ring-gw-brand/[0.14]";

onMounted(() => {
	if (isCheckInDone()) {
		router.replace({ name: "checkinComplete" });
	}
});

function formValid(): boolean {
	return (
		name.value.trim().length > 0 &&
		employeeId.value.trim().length > 0 &&
		Number.isFinite(companionCount.value) &&
		companionCount.value >= 1
	);
}

function openConfirm() {
	if (!formValid()) return;
	showConfirm.value = true;
}

function closeConfirm() {
	showConfirm.value = false;
}

function commitCheckIn() {
	let n = companionCount.value;
	if (!Number.isFinite(n) || n < 1) n = 1;
	companionCount.value = n;
	setProfile(name.value, employeeId.value);
	setCompanionCount(n);
	setCheckInDone(true);
	clearEntryIntent();
	showConfirm.value = false;
	router.push({ name: "checkinComplete" });
}
</script>

<template>
	<div
		class="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-b from-gw-mint/55 via-white to-[#ecfdf5]/95"
	>
		<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
			<div
				class="gw-login-blob -left-[28%] -top-[18%] h-[22rem] w-[22rem] bg-gw-brand/30"
				style="animation-delay: -4s"
			/>
			<div
				class="gw-login-blob -right-[24%] top-[12%] h-[26rem] w-[26rem] bg-sky-200/50"
				style="animation-delay: -9s"
			/>
			<div
				class="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(26,157,74,0.12),transparent_55%)]"
			/>
		</div>

		<div class="pointer-events-none absolute inset-0 z-[1] opacity-[0.95]" aria-hidden="true">
			<PageCritters variant="inline" />
		</div>

		<div
			class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[3px] bg-gradient-to-r from-transparent via-gw-brand/70 to-transparent shadow-[0_2px_16px_rgba(26,157,74,0.35)]"
			aria-hidden="true"
		/>

		<AppHeader class="relative z-[3]" :show-progress="false" :show-user="false" />

		<main class="relative z-[3] flex flex-1 flex-col px-4 pb-6 pt-2 sm:px-7">
			<div
				class="gw-login-panel gw-cover-in mx-auto mt-2 flex w-full max-w-[420px] flex-1 flex-col rounded-[1.85rem] border border-white/80 bg-white/72 p-6 shadow-[0_24px_64px_-18px_rgba(26,157,74,0.22),0_12px_40px_rgba(15,31,46,0.1)] backdrop-blur-xl sm:p-8 sm:pb-10"
				style="--gw-d: 40ms"
			>
				<header class="text-center">
					<div class="relative mx-auto flex h-[4.25rem] w-[4.25rem] items-center justify-center">
						<div
							class="absolute inset-[-10px] rounded-[1.35rem] bg-gradient-to-br from-gw-brand/25 via-white/40 to-amber-100/30 opacity-90 blur-md"
							aria-hidden="true"
						/>
						<BrandLogo size="lg" class="relative z-10 drop-shadow-sm" />
					</div>
					<p class="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-gw-brand/70">
						CHECK-IN
					</p>
					<h1 class="gw-login-title font-display mt-3 text-[1.65rem] font-bold tracking-tight sm:text-[1.85rem]">
						現場報到
					</h1>
					<p class="mx-auto mt-4 max-w-[20rem] text-pretty text-sm font-medium leading-relaxed text-neutral-600">
						請填寫下列資料；確認後將顯示報到完成頁（原型暫存於瀏覽器）。
					</p>
				</header>

				<form class="mt-9 flex flex-1 flex-col gap-6" @submit.prevent="openConfirm" novalidate>
					<div class="space-y-2">
						<label
							for="checkin-name"
							class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gw-brand-dark/70"
						>
							姓名
						</label>
						<input
							id="checkin-name"
							v-model="name"
							type="text"
							name="name"
							autocomplete="name"
							placeholder="請輸入姓名"
							:class="inputClass"
						/>
					</div>
					<div class="space-y-2">
						<label
							for="checkin-employee-id"
							class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gw-brand-dark/70"
						>
							員工編號
						</label>
						<input
							id="checkin-employee-id"
							v-model="employeeId"
							type="text"
							name="username"
							autocomplete="username"
							placeholder="例如 1141041"
							:class="inputClass"
						/>
					</div>
					<div class="space-y-2">
						<label
							for="checkin-companions"
							class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gw-brand-dark/70"
						>
							同行人數
						</label>
						<input
							id="checkin-companions"
							v-model.number="companionCount"
							type="number"
							min="1"
							max="99"
							:class="inputClass"
						/>
					</div>

					<div
						class="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-white to-gw-mint/25 px-4 py-3.5 text-sm leading-relaxed text-amber-950/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-amber-100/60"
						role="status"
					>
						<p class="text-pretty">
							送出前請再確認；若與報名資料不符，可能影響<strong class="font-semibold text-gw-navy"
								>領獎與現場核對</strong>。
						</p>
					</div>

					<div class="mt-auto pt-2">
						<button
							type="submit"
							:disabled="!formValid()"
							class="gw-login-submit group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gw-brand py-4 text-base font-bold text-white transition duration-200 ease-out hover:brightness-[1.06] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-gw-brand disabled:cursor-not-allowed disabled:opacity-[0.4] disabled:shadow-none disabled:hover:brightness-100"
						>
							<span class="relative z-10">確定</span>
						</button>
						<p class="mt-3 text-center text-xs text-neutral-500">
							將先顯示確認視窗；完成後僅報到完成頁，闖關請另掃<strong class="font-semibold text-neutral-700"
								>闖關 QR</strong>。
						</p>
					</div>
				</form>
			</div>
		</main>

		<AppFooter class="relative z-[3]" />

		<Teleport to="body">
			<div
				v-if="showConfirm"
				class="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 px-4 pb-8 pt-12 sm:items-center sm:pb-12"
				role="dialog"
				aria-modal="true"
				aria-labelledby="checkin-confirm-title"
			>
				<div
					class="max-h-[min(85dvh,32rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/80 bg-white p-6 shadow-2xl ring-1 ring-black/5"
					@click.stop
				>
					<div
						class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gw-mint/60 text-2xl text-gw-brand-dark"
						aria-hidden="true"
					>
						✓
					</div>
					<h2
						id="checkin-confirm-title"
						class="font-display mt-4 text-center text-lg font-bold text-gw-navy"
					>
						請確認以下資料無誤
					</h2>
					<dl class="mt-5 space-y-3 rounded-xl bg-neutral-50/90 px-4 py-4 text-sm">
						<div class="flex justify-between gap-3 border-b border-neutral-200/80 pb-3">
							<dt class="text-neutral-500">姓名</dt>
							<dd class="font-semibold text-gw-navy">{{ name.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3 border-b border-neutral-200/80 pb-3">
							<dt class="text-neutral-500">員工編號</dt>
							<dd class="font-semibold text-gw-navy">{{ employeeId.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3">
							<dt class="text-neutral-500">同行人數</dt>
							<dd class="font-semibold text-gw-navy">{{ companionCount }} 位</dd>
						</div>
					</dl>
					<div class="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
						<button
							type="button"
							class="rounded-2xl bg-gw-brand py-3.5 text-center text-base font-bold text-white shadow-btn transition hover:brightness-[1.05] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gw-brand focus-visible:ring-offset-2 sm:min-w-[8rem]"
							@click="commitCheckIn"
						>
							確認
						</button>
						<button
							type="button"
							class="rounded-2xl border border-neutral-200 bg-white py-3.5 text-center text-base font-semibold text-gw-navy transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 sm:min-w-[8rem]"
							@click="closeConfirm"
						>
							回上頁
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
