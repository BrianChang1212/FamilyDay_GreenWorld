<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { resetScavengerRun, setProfile } from "@/lib/demoState";
import { getEntryIntent } from "@/lib/entryIntent";

const router = useRouter();
const name = ref("");
const employeeId = ref("");

const isGame = computed(() => getEntryIntent() === "game");

onMounted(() => {
	if (getEntryIntent() === "checkin") {
		router.replace({ name: "checkin" });
	}
});

const inputClass =
	"w-full rounded-2xl border-0 bg-[#eef0ed] px-4 py-3.5 text-base text-gw-navy shadow-inner outline-none ring-1 ring-black/[0.04] transition focus:ring-2 focus:ring-gw-brand/35 placeholder:text-neutral-400";

function submit() {
	if (!name.value.trim() || !employeeId.value.trim()) return;
	setProfile(name.value, employeeId.value);
	resetScavengerRun();
	router.push({ name: "stage" });
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
						2026 AMTRAN FAMILY DAY
					</span>
				</div>
				<h1 class="font-display mt-8 text-[1.35rem] font-bold leading-snug text-gw-navy">
					<span class="block">請輸入您的</span>
					<span class="mt-1 block font-bold italic text-[#1a5f2a]">基本資料</span>
				</h1>
				<div class="mt-3 h-1 w-14 rounded-full bg-[#e8a87c]" aria-hidden="true" />
			</header>

			<form class="mt-10 flex flex-1 flex-col gap-6" @submit.prevent="submit" novalidate>
				<div class="space-y-2">
					<label for="reg-name" class="text-sm font-bold text-neutral-600">姓名</label>
					<input
						id="reg-name"
						v-model="name"
						type="text"
						name="name"
						autocomplete="name"
						placeholder="請輸入您的姓名"
						:class="inputClass"
					/>
				</div>
				<div class="space-y-2">
					<label for="reg-employee-id" class="text-sm font-bold text-neutral-600">員工編號</label>
					<input
						id="reg-employee-id"
						v-model="employeeId"
						type="text"
						name="username"
						autocomplete="username"
						placeholder="例如：AM12345"
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
						資料將用於家庭日當天<strong class="text-gw-navy">闖關紀錄與抽獎資格核對</strong>，請確保資訊填寫正確。
					</p>
				</div>

				<div class="mt-auto pt-4">
					<button
						type="submit"
						:disabled="!name.trim() || !employeeId.trim()"
						class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(26,95,42,0.25)] transition enabled:active:scale-[0.99] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
					>
						確定
						<span aria-hidden="true">›</span>
					</button>
				</div>
			</form>

			<p v-if="!isGame" class="mt-4 text-center text-xs text-neutral-500">
				一般動線：填寫後將進入闖關地圖。
			</p>
			<p class="mt-6 text-center text-xs text-neutral-400">© 2026 AmTRAN Technology Co., Ltd.</p>
		</main>

		<AppFooter class="relative z-[1] border-t-0 bg-transparent" />
	</div>
</template>
