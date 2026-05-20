<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import GwBrandBar from "@/components/GwBrandBar.vue";
import { resetScavengerRun, setProfile } from "@/lib/demoState";
import { getEntryIntent } from "@/lib/entryIntent";
import { loginGame } from "@/api/authLogin";
import {
	restartPlaythrough,
	syncLocalProgressFromDashboard,
} from "@/api/gameFlow";
import { getViteApiBase } from "@/lib/apiBase";
import { useI18n } from "@/composables/useI18n";
import { fetchRosterLookup } from "@/api/rosterLookup";

const router = useRouter();
const { t } = useI18n();
const name = ref("");
const employeeId = ref("");
const isSubmitting = ref(false);
const submitError = ref("");
const nameLookupState = ref<"idle" | "loading" | "found" | "not_found">("idle");

onMounted(() => {
	if (getEntryIntent() === "checkin") {
		router.replace({ name: "checkinWelcome" });
	}
});

const inputClass =
	"w-full rounded-xl border-0 bg-[#eef0ed] px-4 py-3.5 pr-12 text-base text-gw-navy outline-none ring-1 ring-black/[0.04] transition focus:bg-white focus:ring-2 focus:ring-[#2f7354]/30 placeholder:text-neutral-400";

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

function friendlyAuthError(err: unknown): string {
	if (!(err instanceof Error)) {
		return "登入失敗，請稍後再試。";
	}
	if (err.message.includes("AUTH_IDENTITY_MISMATCH")) {
		return "員工編號查無此人，請確認後再試。";
	}
	if (err.message.includes("INVALID_AUTH_PAYLOAD")) {
		return "登入資料不完整，請確認員工編號。";
	}
	if (err.message.includes("Failed to fetch")) {
		return "無法連線到伺服器，請確認網路與 API 服務狀態。";
	}
	return "登入失敗，請稍後再試。";
}

function formValid(): boolean {
	return (
		nameLookupState.value === "found" &&
		name.value.trim().length > 0 &&
		employeeId.value.trim().length > 0
	);
}

async function submitAuthApi(nameValue: string, employeeIdValue: string) {
	await loginGame(nameValue, employeeIdValue);
}

async function submit() {
	if (isSubmitting.value) return;
	const nameValue = name.value.trim();
	const employeeIdValue = employeeId.value.trim();
	if (!formValid()) return;

	isSubmitting.value = true;
	submitError.value = "";
	try {
		await submitAuthApi(nameValue, employeeIdValue);
		setProfile(nameValue, employeeIdValue);
		resetScavengerRun();
		/* 後端若仍保留上一輪通關紀錄，sync 會把舊進度寫回；須先 restart 再 sync。 */
		if (getViteApiBase()) {
			let restarted = false;
			try {
				await restartPlaythrough();
				restarted = true;
			} catch {
				/* 離線或 API 不可用：維持僅清除 session，避免 sync 拉回舊儀表板 */
			}
			if (restarted) {
				try {
					await syncLocalProgressFromDashboard();
				} catch {
					/* ignore when dashboard is unreachable */
				}
			}
		}
		router.push({ name: "stage" });
	} catch (err) {
		submitError.value = friendlyAuthError(err);
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#eef0eb]">
		<GwBrandBar />

		<main
			class="relative z-[1] flex flex-1 flex-col px-4 pb-8 pt-2 sm:mx-auto sm:w-full sm:max-w-md sm:px-6 sm:pt-3"
		>
			<div class="flex justify-center pb-3 pt-0">
				<img
					src="/images/icon-register-rocket.png"
					width="330"
					height="330"
					:alt="t('register.heroRocketAlt')"
					class="h-[7.25rem] w-[7.25rem] shrink-0 rounded-full object-cover shadow-[0_2px_14px_rgba(47,115,84,0.18)] ring-4 ring-white/90"
					loading="eager"
					decoding="async"
				/>
			</div>

			<h1
				class="font-display w-full pb-6 text-center text-xl font-extrabold leading-snug text-[#2f7354] sm:text-[1.35rem]"
			>
				{{ t("register.heroTitle") }}
			</h1>

			<form class="flex flex-1 flex-col" @submit.prevent="submit" novalidate>
				<div
					class="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-md ring-1 ring-black/[0.04]"
				>
					<div class="space-y-5">
						<div class="space-y-2">
							<label
								for="reg-employee-id"
								class="text-sm font-bold text-neutral-600"
								>{{ t("checkin.form.employeeId") }}</label
							>
							<div class="relative">
								<input
									id="reg-employee-id"
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
							<label
								for="reg-name"
								class="text-sm font-bold text-neutral-600"
								>{{ t("checkin.form.name") }}</label
							>
							<div class="relative">
								<input
									id="reg-name"
									:value="nameLookupState === 'loading' ? '查詢中…' : name"
									type="text"
									name="name"
									readonly
									:placeholder="nameLookupState === 'not_found' ? '查無此員工編號' : '輸入員工編號後自動帶入'"
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
								{{ t("register.infoNotice") }}
							</p>
						</div>
					</div>
				</div>

				<div class="mt-8">
					<button
						type="submit"
						:disabled="isSubmitting || !formValid()"
						class="gw-checkin-cta gw-checkin-cta--pill disabled:cursor-not-allowed disabled:opacity-45"
					>
						{{ isSubmitting ? t("register.signingIn") : t("register.submitButton") }}
					</button>
					<p
						v-if="submitError"
						class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-800"
						role="alert"
					>
						{{ submitError }}
					</p>
				</div>
			</form>

			<p class="mt-8 text-center text-xs text-neutral-400">{{ t("footer.copyright") }}</p>
		</main>

		<AppFooter class="relative z-[1]" />
	</div>
</template>
