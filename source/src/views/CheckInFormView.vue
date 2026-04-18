<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import {
	getCompanionCount,
	getProfile,
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

const companionOptions = Array.from({ length: 20 }, (_, i) => i + 1);

const inputClass =
	"w-full rounded-2xl border-0 bg-[#eef0ed] px-4 py-3.5 text-base text-gw-navy shadow-inner outline-none ring-1 ring-black/[0.04] transition focus:ring-2 focus:ring-gw-brand/35 placeholder:text-neutral-400";

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
	<div class="relative flex min-h-full flex-col bg-[#f7f8f6]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-6 pt-8 sm:mx-auto sm:max-w-md sm:px-6">
			<header class="text-left">
				<div class="flex items-start gap-2">
					<span class="text-xl leading-none text-gw-brand" aria-hidden="true">🌲</span>
					<span
						class="inline-flex rounded-full bg-gw-mint/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gw-brand-dark ring-1 ring-gw-mint-soft"
					>
						2026 AMTRAN FAMILY DAY
					</span>
				</div>
				<h1 class="font-display mt-6 text-[1.4rem] font-bold leading-snug tracking-tight text-gw-navy sm:text-[1.55rem]">
					歡迎來到瑞軒科技2026家庭日
				</h1>
				<p class="mt-3 text-base font-bold text-gw-brand">請輸入以下資料完成報到</p>
				<div class="mt-2 h-1 w-12 rounded-full bg-[#e8a87c]" aria-hidden="true" />
			</header>

			<form class="mt-10 flex flex-1 flex-col gap-6" @submit.prevent="openConfirm" novalidate>
				<div class="space-y-2">
					<label for="checkin-name" class="text-sm font-bold text-neutral-600">姓名</label>
					<input
						id="checkin-name"
						v-model="name"
						type="text"
						name="name"
						autocomplete="name"
						placeholder="請輸入您的姓名"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="checkin-employee-id" class="text-sm font-bold text-neutral-600">員工編號</label>
					<input
						id="checkin-employee-id"
						v-model="employeeId"
						type="text"
						name="username"
						autocomplete="username"
						placeholder="例如：AM12345"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="checkin-companions" class="text-sm font-bold text-neutral-600">同行人數</label>
					<div class="relative">
						<select
							id="checkin-companions"
							v-model.number="companionCount"
							:class="[
								inputClass,
								'cursor-pointer appearance-none bg-[#eef0ed] pr-10',
							]"
						>
							<option v-for="n in companionOptions" :key="n" :value="n">
								{{ n }} 位{{ n === 1 ? "（本人）" : "" }}
							</option>
						</select>
						<span
							class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gw-brand"
							aria-hidden="true"
							>⌄</span
						>
					</div>
				</div>

				<div
					class="flex gap-3 rounded-2xl border border-neutral-200/80 bg-white px-4 py-4 shadow-sm ring-1 ring-black/[0.03]"
					role="status"
				>
					<span
						class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
						aria-hidden="true"
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
							<path
								d="M12 10v5M12 7h.01"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</span>
					<p class="border-l-4 border-[#8b6914]/40 pl-3 text-sm leading-relaxed text-neutral-700">
						資料將用於家庭日當天<strong class="text-gw-navy">出席紀錄與人數核對</strong>，請確保資訊填寫正確。
					</p>
				</div>

				<div class="mt-auto pt-4">
					<button
						type="submit"
						:disabled="!formValid()"
						class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,95,42,0.25)] transition enabled:active:scale-[0.99] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
					>
						確定
						<span aria-hidden="true">›</span>
					</button>
				</div>
			</form>

			<p class="mt-6 text-center text-xs text-neutral-400">© 2026 AmTRAN Technology Co., Ltd.</p>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />

		<Teleport to="body">
			<div
				v-if="showConfirm"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]"
				role="dialog"
				aria-modal="true"
				aria-labelledby="checkin-confirm-title"
			>
				<div
					class="w-full max-w-md rounded-[1.35rem] bg-white p-6 shadow-2xl ring-1 ring-black/5"
					@click.stop
				>
					<div class="flex flex-col items-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-gw-mint ring-4 ring-gw-mint-soft/50"
							aria-hidden="true"
						>
							<div
								class="flex h-11 w-11 items-center justify-center rounded-full bg-gw-brand text-lg text-white"
							>
								✓
							</div>
						</div>
						<h2
							id="checkin-confirm-title"
							class="font-display mt-5 text-center text-lg font-bold text-gw-navy"
						>
							請確認以下報到資訊正確
						</h2>
					</div>
					<dl class="mt-6 divide-y divide-neutral-100">
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">姓名</dt>
							<dd class="font-bold text-gw-navy">{{ name.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">員工編號</dt>
							<dd class="font-bold text-gw-navy">{{ employeeId.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">同行人數</dt>
							<dd class="font-bold text-gw-navy">{{ companionCount }} 位</dd>
						</div>
					</dl>
					<div class="mt-6 flex flex-col gap-3">
						<button
							type="button"
							class="w-full rounded-full bg-[#1a5f2a] py-3.5 text-center text-base font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.99]"
							@click="commitCheckIn"
						>
							確認
						</button>
						<button
							type="button"
							class="w-full rounded-full bg-[#e8e4dc] py-3.5 text-center text-base font-semibold text-neutral-800 transition hover:bg-[#ded9cf] active:scale-[0.99]"
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
