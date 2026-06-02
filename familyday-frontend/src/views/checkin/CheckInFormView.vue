<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import {
	getCompanionCount,
	getProfile,
	setCheckInDone,
	setCompanionCount,
	setProfile,
} from "@/lib/demoState";
import { clearEntryIntent } from "@/lib/entryIntent";
import { submitCheckin } from "@/api/submitCheckin";
import { fetchRosterLookup } from "@/api/rosterLookup";
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
const nameLookupState = ref<"idle" | "loading" | "found" | "not_found">("idle");

// 從 0 開始（0 = 沒有攜伴），最多 MAX_COMPANIONS
const companionOptions = Array.from(
	{ length: APP_CONFIG.MAX_COMPANIONS + 1 },
	(_, i) => i,
);

const inputClass =
	"w-full rounded-xl border-0 bg-[#f6f7f6] px-4 py-3.5 pr-12 text-base text-gw-navy outline-none ring-1 ring-black/[0.03] transition focus:bg-white focus:ring-2 focus:ring-[#2f7354]/30 placeholder:text-neutral-400";

let lookupTimer: ReturnType<typeof setTimeout> | null = null;

function onEmployeeIdInput() {
	name.value = "";
	nameLookupState.value = "idle";
	if (lookupTimer) clearTimeout(lookupTimer);
	const id = employeeId.value.trim();
	if (id.length < 7) return;
	lookupTimer = setTimeout(async () => {
		nameLookupState.value = "loading";
		try {
			const result = await fetchRosterLookup(id);
			if (result) {
				name.value = result.name;
				nameLookupState.value = "found";
			} else {
				nameLookupState.value = "not_found";
			}
		} catch {
			nameLookupState.value = "not_found";
		}
	}, 500);
}

function friendlyCheckinError(err: unknown): string {
	if (!(err instanceof Error)) {
		return "報到失敗，請稍後再試。";
	}
	if (err.message.includes("CHECKIN_IDENTITY_MISMATCH")) {
		return "員工編號查無此人，請確認後再試。";
	}
	if (err.message.includes("INVALID_CHECKIN_PAYLOAD")) {
		return "報到資料不完整，請確認員工編號與同行人數。";
	}
	if (err.message.includes("Failed to fetch")) {
		return "無法連線到伺服器，請確認網路與 API 服務狀態。";
	}
	return "報到失敗，請稍後再試。";
}

function formValid(): boolean {
	return (
		nameLookupState.value === "found" &&
		name.value.trim().length > 0 &&
		employeeId.value.trim().length > 0 &&
		Number.isFinite(companionCount.value) &&
		companionCount.value >= 0
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
	if (!Number.isFinite(n) || n < 0) n = 0;
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
		<GwBrandBar />

		<main class="relative z-[1] flex flex-1 flex-col px-4 pb-6 pt-4 sm:mx-auto sm:max-w-md sm:px-6">
			<header class="text-center">
				<p class="text-lg font-semibold tracking-wide text-neutral-900">歡迎來到</p>
				<h1 class="font-display mt-2 text-[1.7rem] font-extrabold leading-tight tracking-tight text-[#2f7354] sm:text-[1.9rem]">
					瑞軒科技{{ APP_CONFIG.YEAR }}家庭日
				</h1>
				<p class="mt-3 text-xs font-medium text-neutral-600">{{ t('checkin.subtitle') }}</p>
			</header>

			<form class="mt-5 flex flex-1 flex-col" @submit.prevent="openConfirm" novalidate>
				<section
					class="space-y-5 rounded-2xl border border-neutral-200/80 bg-white px-5 py-6 shadow-sm ring-1 ring-black/[0.02]"
				>
					<div class="space-y-2">
						<label for="checkin-employee-id" class="text-sm font-bold text-neutral-700">{{ t('checkin.form.employeeId') }}</label>
						<div class="relative">
							<input
								id="checkin-employee-id"
								v-model="employeeId"
								type="text"
								name="username"
								autocomplete="username"
								:placeholder="t('checkin.form.employeeIdPlaceholder')"
								:class="inputClass"
								@input="onEmployeeIdInput"
							/>
							<span
								class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300"
								aria-hidden="true"
							>
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
									<rect
										x="5"
										y="6"
										width="14"
										height="14"
										rx="2"
										stroke="currentColor"
										stroke-width="1.8"
									/>
									<path
										d="M9 4v4M15 4v4M8.5 12h7M8.5 16h4"
										stroke="currentColor"
										stroke-linecap="round"
										stroke-width="1.8"
									/>
								</svg>
							</span>
						</div>
					</div>

					<div class="space-y-2">
						<label for="checkin-name" class="text-sm font-bold text-neutral-700">{{ t('checkin.form.name') }}</label>
						<div class="relative">
							<input
								id="checkin-name"
								:value="nameLookupState === 'loading' ? '查詢中…' : name"
								type="text"
								name="name"
								readonly
								:placeholder="nameLookupState === 'not_found' ? '查無此員工編號' : '輸入員工編號後自動帶入'"
								:class="[inputClass, 'cursor-default select-none', nameLookupState === 'not_found' ? 'ring-red-300 placeholder:text-red-400' : 'bg-neutral-100 text-neutral-500']"
							/>
							<span
								class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300"
								aria-hidden="true"
							>
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
										stroke="currentColor"
										stroke-width="1.8"
									/>
									<path
										d="M5 20a7 7 0 0 1 14 0"
										stroke="currentColor"
										stroke-linecap="round"
										stroke-width="1.8"
									/>
								</svg>
							</span>
						</div>
					</div>

					<div class="space-y-2">
						<label for="checkin-companions" class="text-sm font-bold text-neutral-700">{{ t('checkin.form.companions') }}</label>
						<div class="relative">
							<select
								id="checkin-companions"
								v-model.number="companionCount"
								:class="[inputClass, 'cursor-pointer appearance-none']"
							>
								<option v-for="n in companionOptions" :key="n" :value="n">
									{{ n === 0 ? t('checkin.form.companionUnitZero') : `${n} ${t('checkin.form.companionUnit')}` }}
								</option>
							</select>
							<span
								class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
								aria-hidden="true"
								>⌄</span
							>
						</div>
					</div>

					<div
						class="flex gap-3 rounded-xl border border-[#f3c7a7] bg-[#fff3ea] px-4 py-4 text-[#a7541f]"
						role="status"
					>
						<span
							class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#df8b43] text-xs font-bold"
							aria-hidden="true"
						>
							i
						</span>
						<p class="text-sm font-medium leading-relaxed">
							{{ t('checkin.notice') }}
						</p>
					</div>
				</section>

				<div class="mt-auto pt-7">
					<button
						type="submit"
						:disabled="!formValid()"
						class="gw-checkin-cta disabled:cursor-not-allowed disabled:opacity-45"
					>
						{{ t('checkin.submitButton') }}
						<span aria-hidden="true">›</span>
					</button>
				</div>
			</form>

			<p class="mt-6 text-center text-xs text-neutral-400">
				{{ t("footer.copyright") }}
			</p>
		</main>

		<AppFooter class="relative z-[1]" />

		<Teleport to="body">
			<div
				v-if="showConfirm"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/55 px-4 backdrop-blur-[2px]"
				role="dialog"
				aria-modal="true"
				aria-labelledby="checkin-confirm-title"
			>
				<div
					class="w-full max-w-md rounded-[1.35rem] bg-white p-6 shadow-2xl ring-1 ring-black/[0.06]"
					@click.stop
				>
					<div class="flex flex-col items-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f4ee] ring-4 ring-[#d7ebdf]"
							aria-hidden="true"
						>
							<div
								class="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f7354] text-lg font-bold text-white"
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
							<dd class="font-bold text-gw-navy">{{ companionCount === 0 ? t('checkin.form.companionUnitZero') : `${companionCount} ${t('checkin.form.companionUnit')}` }}</dd>
						</div>
					</dl>
					<div class="mt-6 flex flex-col gap-3">
						<button
							type="button"
							:disabled="isSubmitting"
							class="gw-checkin-cta gw-checkin-cta--pill disabled:cursor-not-allowed disabled:opacity-60"
							@click="commitCheckIn"
						>
							{{ isSubmitting ? "Submitting..." : t('common.confirm') }}
						</button>
						<button
							type="button"
							:disabled="isSubmitting"
							class="w-full rounded-full bg-[#e8e4dc] py-3.5 text-center text-base font-semibold text-[#343831] transition enabled:hover:bg-[#ded9cf] enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
