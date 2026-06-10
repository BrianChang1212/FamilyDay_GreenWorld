<script setup lang="ts">
import { ref } from "vue";
import { loginGame } from "@/api/authLogin";
import { fetchRosterLookup } from "@/api/rosterLookup";
import { setProfile } from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";
import { shouldLookupEmployeeId } from "@/lib/employeeId";

/*
 * 外部 QR scanner → /scan → /quiz 的「未登入」彈窗。
 * 沒有「取消」按鈕、沒有 backdrop click dismiss——唯一退路是登入成功；
 * 登入後 emit('success') 由 parent (QuizView) 關 modal 並觸發題目 fetch。
 */
const emit = defineEmits<{ (e: "success"): void }>();
const { t } = useI18n();

const employeeId = ref("");
const name = ref("");
const isSubmitting = ref(false);
const submitError = ref("");
const nameLookupState = ref<"idle" | "loading" | "found" | "not_found">("idle");

let lookupTimer: ReturnType<typeof setTimeout> | null = null;

function onEmployeeIdInput() {
	name.value = "";
	nameLookupState.value = "idle";
	if (lookupTimer) clearTimeout(lookupTimer);
	const id = employeeId.value.trim();
	if (!shouldLookupEmployeeId(id)) return;
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

function friendlyAuthError(err: unknown): string {
	if (!(err instanceof Error)) return "登入失敗，請稍後再試。";
	if (err.message.includes("AUTH_IDENTITY_MISMATCH")) return "員工編號查無此人，請確認後再試。";
	if (err.message.includes("INVALID_AUTH_PAYLOAD")) return "登入資料不完整，請確認員工編號。";
	if (err.message.includes("Failed to fetch")) return "無法連線到伺服器，請確認網路與 API 服務狀態。";
	return "登入失敗，請稍後再試。";
}

function formValid(): boolean {
	return (
		nameLookupState.value === "found" &&
		name.value.trim().length > 0 &&
		employeeId.value.trim().length > 0
	);
}

async function submit() {
	if (isSubmitting.value || !formValid()) return;
	const nameValue = name.value.trim();
	const employeeIdValue = employeeId.value.trim();
	isSubmitting.value = true;
	submitError.value = "";
	try {
		await loginGame(nameValue, employeeIdValue);
		setProfile(nameValue, employeeIdValue);
		emit("success");
	} catch (err) {
		submitError.value = friendlyAuthError(err);
	} finally {
		isSubmitting.value = false;
	}
}

const inputClass =
	"w-full rounded-xl border-0 bg-[#eef0ed] px-4 py-3.5 pr-12 text-base text-gw-navy outline-none ring-1 ring-black/[0.04] transition focus:bg-white focus:ring-2 focus:ring-[#2f7354]/30 placeholder:text-neutral-400";
</script>

<template>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5"
		role="dialog"
		aria-modal="true"
		aria-labelledby="scan-login-title"
	>
		<div
			class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/[0.06] sm:p-7"
		>
			<div class="flex justify-center pb-3">
				<span
					class="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f0ea] text-[#2f7354]"
					aria-hidden="true"
				>
					<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
						<path
							d="M8 12.5l2.5 2.5L16 9.5"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</span>
			</div>

			<h2
				id="scan-login-title"
				class="font-display pb-5 text-center text-xl font-extrabold leading-snug text-gw-navy"
			>
				{{ t("scanLogin.title") }}
			</h2>

			<form class="flex flex-col gap-5" @submit.prevent="submit" novalidate>
				<div class="space-y-2">
					<label for="scan-login-employee-id" class="text-sm font-bold text-neutral-600">
						{{ t("checkin.form.employeeId") }}
					</label>
					<div class="relative">
						<input
							id="scan-login-employee-id"
							v-model="employeeId"
							type="text"
							name="username"
							autocomplete="username"
							:placeholder="t('register.employeeIdPlaceholder')"
							:class="inputClass"
							@input="onEmployeeIdInput"
						/>
						<span
							class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
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
					<label for="scan-login-name" class="text-sm font-bold text-neutral-600">
						{{ t("checkin.form.name") }}
					</label>
					<div class="relative">
						<input
							id="scan-login-name"
							:value="nameLookupState === 'loading' ? '查詢中…' : name"
							type="text"
							name="name"
							readonly
							:placeholder="nameLookupState === 'not_found' ? '查無此員工編號' : t('register.namePlaceholder')"
							:class="[inputClass, 'cursor-default select-none', nameLookupState === 'not_found' ? 'ring-red-300 placeholder:text-red-400' : 'bg-neutral-100 text-neutral-500']"
						/>
						<span
							class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
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

				<button
					type="submit"
					:disabled="isSubmitting || !formValid()"
					class="mt-2 w-full rounded-2xl bg-[#2f7354] py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
				>
					{{ isSubmitting ? t("register.signingIn") : t("scanLogin.submitButton") }}
				</button>

				<p
					v-if="submitError"
					class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
					role="alert"
				>
					{{ submitError }}
				</p>
			</form>
		</div>
	</div>
</template>
