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
import { submitCheckin } from "@/api/submitCheckin";
import { useI18n } from "@/composables/useI18n";
import { APP_CONFIG } from "@/constants";

const router = useRouter();
const { t } = useI18n();

const p0 = getProfile();
const name = ref(p0.name);
const employeeId = ref(p0.employeeId);
const companionCount = ref(getCompanionCount());
const showConfirm = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");

const companionOptions = Array.from(
	{ length: APP_CONFIG.MAX_COMPANIONS },
	(_, i) => i + 1,
);

const inputClass =
	"w-full rounded-2xl border-0 bg-[#eef0ed] px-4 py-3.5 text-base text-gw-navy shadow-inner outline-none ring-1 ring-black/[0.04] transition focus:ring-2 focus:ring-gw-brand/35 placeholder:text-neutral-400";

function friendlyCheckinError(err: unknown): string {
	if (!(err instanceof Error)) {
		return "報到失敗，請稍後再試。";
	}
	if (err.message.includes("CHECKIN_IDENTITY_MISMATCH")) {
		return "姓名與員工編號不一致，請確認後再試。";
	}
	if (err.message.includes("INVALID_CHECKIN_PAYLOAD")) {
		return "報到資料不完整，請確認姓名、員工編號與同行人數。";
	}
	if (err.message.includes("Failed to fetch")) {
		return "無法連線到伺服器，請確認網路與 API 服務狀態。";
	}
	return "報到失敗，請稍後再試。";
}

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
	submitError.value = "";
	showConfirm.value = true;
}

function closeConfirm() {
	if (isSubmitting.value) return;
	showConfirm.value = false;
}

async function submitCheckInApi(
	nameValue: string,
	employeeIdValue: string,
	partySizeValue: number,
) {
	await submitCheckin({
		name: nameValue,
		employeeId: employeeIdValue,
		partySize: partySizeValue,
	});
}

async function commitCheckIn() {
	if (isSubmitting.value) return;
	let n = companionCount.value;
	if (!Number.isFinite(n) || n < 1) n = 1;
	companionCount.value = n;
	isSubmitting.value = true;
	submitError.value = "";
	try {
		await submitCheckInApi(
			name.value.trim(),
			employeeId.value.trim(),
			n,
		);
		setProfile(name.value, employeeId.value);
		setCompanionCount(n);
		setCheckInDone(true);
		clearEntryIntent();
		showConfirm.value = false;
		router.push({ name: "checkinComplete" });
	} catch (err) {
		submitError.value = friendlyCheckinError(err);
	} finally {
		isSubmitting.value = false;
	}
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
						{{ t('checkin.tag') }}
					</span>
				</div>
				<h1 class="font-display mt-6 text-[1.4rem] font-bold leading-snug tracking-tight text-gw-navy sm:text-[1.55rem]">
					{{ t('checkin.title') }}
				</h1>
				<p class="mt-3 text-base font-bold text-gw-brand">{{ t('checkin.subtitle') }}</p>
				<div class="mt-2 h-1 w-12 rounded-full bg-[#e8a87c]" aria-hidden="true" />
			</header>

			<form class="mt-10 flex flex-1 flex-col gap-6" @submit.prevent="openConfirm" novalidate>
				<div class="space-y-2">
					<label for="checkin-name" class="text-sm font-bold text-neutral-600">{{ t('checkin.form.name') }}</label>
					<input
						id="checkin-name"
						v-model="name"
						type="text"
						name="name"
						autocomplete="name"
						:placeholder="t('checkin.form.namePlaceholder')"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="checkin-employee-id" class="text-sm font-bold text-neutral-600">{{ t('checkin.form.employeeId') }}</label>
					<input
						id="checkin-employee-id"
						v-model="employeeId"
						type="text"
						name="username"
						autocomplete="username"
						:placeholder="t('checkin.form.employeeIdPlaceholder')"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="checkin-companions" class="text-sm font-bold text-neutral-600">{{ t('checkin.form.companions') }}</label>
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
								{{ n }} {{ t('checkin.form.companionUnit') }}{{ n === 1 ? t('checkin.form.self') : "" }}
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
						{{ t('checkin.notice') }}
					</p>
				</div>

				<div class="mt-auto pt-4">
					<button
						type="submit"
						:disabled="!formValid()"
						class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,95,42,0.25)] transition enabled:active:scale-[0.99] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
					>
						{{ t('common.submit') }}
						<span aria-hidden="true">›</span>
					</button>
				</div>
			</form>

			<p class="mt-6 text-center text-xs text-neutral-400">
				{{ t("footer.copyright") }}
			</p>
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
							{{ t('checkin.confirmTitle') }}
						</h2>
					</div>
					<dl class="mt-6 divide-y divide-neutral-100">
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">{{ t('checkin.form.name') }}</dt>
							<dd class="font-bold text-gw-navy">{{ name.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">{{ t('checkin.form.employeeId') }}</dt>
							<dd class="font-bold text-gw-navy">{{ employeeId.trim() }}</dd>
						</div>
						<div class="flex justify-between gap-3 py-3 text-sm">
							<dt class="text-neutral-500">{{ t('checkin.form.companions') }}</dt>
							<dd class="font-bold text-gw-navy">{{ companionCount }} {{ t('checkin.form.companionUnit') }}</dd>
						</div>
					</dl>
					<div class="mt-6 flex flex-col gap-3">
						<button
							type="button"
							:disabled="isSubmitting"
							class="w-full rounded-full bg-[#1a5f2a] py-3.5 text-center text-base font-bold text-white shadow-md transition enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
							@click="commitCheckIn"
						>
							{{ isSubmitting ? "Submitting..." : t('common.confirm') }}
						</button>
						<button
							type="button"
							:disabled="isSubmitting"
							class="w-full rounded-full bg-[#e8e4dc] py-3.5 text-center text-base font-semibold text-neutral-800 transition enabled:hover:bg-[#ded9cf] enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
							@click="closeConfirm"
						>
							{{ t('common.back') }}
						</button>
						<p
							v-if="submitError"
							class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
							role="alert"
						>
							{{ submitError }}
						</p>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
