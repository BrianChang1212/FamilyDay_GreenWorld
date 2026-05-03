<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { resetScavengerRun, setProfile } from "@/lib/demoState";
import { getEntryIntent } from "@/lib/entryIntent";
import { loginGame } from "@/api/authLogin";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { t } = useI18n();
const name = ref("");
const employeeId = ref("");
const isSubmitting = ref(false);
const submitError = ref("");

const isGame = computed(() => getEntryIntent() === "game");

onMounted(() => {
	if (getEntryIntent() === "checkin") {
		router.replace({ name: "checkin" });
	}
});

const inputClass =
	"w-full rounded-2xl border-0 bg-[#eef0ed] px-4 py-3.5 text-base text-gw-navy shadow-inner outline-none ring-1 ring-black/[0.04] transition focus:ring-2 focus:ring-gw-brand/35 placeholder:text-neutral-400";

function friendlyAuthError(err: unknown): string {
	if (!(err instanceof Error)) {
		return "登入失敗，請稍後再試。";
	}
	if (err.message.includes("AUTH_IDENTITY_MISMATCH")) {
		return "姓名與員工編號不一致，請確認後再試。";
	}
	if (err.message.includes("INVALID_AUTH_PAYLOAD")) {
		return "登入資料不完整，請確認姓名與員工編號。";
	}
	if (err.message.includes("Failed to fetch")) {
		return "無法連線到伺服器，請確認網路與 API 服務狀態。";
	}
	return "登入失敗，請稍後再試。";
}

async function submitAuthApi(nameValue: string, employeeIdValue: string) {
	await loginGame(nameValue, employeeIdValue);
}

async function submit() {
	if (isSubmitting.value) return;
	const nameValue = name.value.trim();
	const employeeIdValue = employeeId.value.trim();
	if (!nameValue || !employeeIdValue) return;

	isSubmitting.value = true;
	submitError.value = "";
	try {
		await submitAuthApi(nameValue, employeeIdValue);
		setProfile(nameValue, employeeIdValue);
		resetScavengerRun();
		router.push({ name: "stage" });
	} catch (err) {
		submitError.value = friendlyAuthError(err);
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f7f8f6]">
		<main class="relative z-[1] flex flex-1 flex-col px-5 pb-8 pt-8 sm:mx-auto sm:max-w-md">
			<header>
				<div class="flex items-start gap-2">
					<span class="text-xl leading-none text-gw-brand" aria-hidden="true">🌲</span>
					<span
						class="inline-flex rounded-full bg-gw-mint/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gw-brand-dark ring-1 ring-gw-mint-soft"
					>
						{{ t("register.tag") }}
					</span>
				</div>
				<h1 class="font-display mt-8 text-[1.35rem] font-bold leading-snug text-gw-navy">
					<span class="block">{{ t("register.titleLine1") }}</span>
					<span class="mt-1 block font-bold italic text-[#1a5f2a]">{{
						t("register.titleLine2")
					}}</span>
				</h1>
				<div class="mt-3 h-1 w-14 rounded-full bg-[#e8a87c]" aria-hidden="true" />
			</header>

			<form class="mt-10 flex flex-1 flex-col gap-6" @submit.prevent="submit" novalidate>
				<div class="space-y-2">
					<label for="reg-name" class="text-sm font-bold text-neutral-600">{{
						t("checkin.form.name")
					}}</label>
					<input
						id="reg-name"
						v-model="name"
						type="text"
						name="name"
						autocomplete="name"
						:placeholder="t('checkin.form.namePlaceholder')"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="reg-employee-id" class="text-sm font-bold text-neutral-600">{{
						t("checkin.form.employeeId")
					}}</label>
					<input
						id="reg-employee-id"
						v-model="employeeId"
						type="text"
						name="username"
						autocomplete="username"
						:placeholder="t('checkin.form.employeeIdPlaceholder')"
						:class="inputClass"
					/>
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
						{{ t("register.infoNotice") }}
					</p>
				</div>

				<div class="mt-auto pt-4">
					<button
						type="submit"
						:disabled="isSubmitting || !name.trim() || !employeeId.trim()"
						class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,95,42,0.25)] transition enabled:active:scale-[0.99] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
					>
						{{ isSubmitting ? "Signing in..." : t("register.submitButton") }}
						<span aria-hidden="true">›</span>
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

			<p v-if="!isGame" class="mt-4 text-center text-xs text-neutral-500">
				{{ t("register.normalFlowHint") }}
			</p>
			<p class="mt-6 text-center text-xs text-neutral-400">{{ t("footer.copyright") }}</p>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
