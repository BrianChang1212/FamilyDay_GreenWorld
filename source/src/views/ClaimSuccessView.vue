<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppFooter from "@/components/AppFooter.vue";
import { fetchRewardClaimStatus } from "@/api/rewardClaimStatus";
import { getViteApiBase } from "@/lib/apiBase";
import {
	CLAIM_SUCCESS_STICKER_SRC,
	FINISH_REWARD_SLOTS,
	getFinishClaimedCount,
	getProfile,
} from "@/lib/demoState";

const router = useRouter();
const route = useRoute();

const name = ref("");
const employeeId = ref("");
/** 已由後端（或原型後備）確認的領取次數，僅供畫面映射 */
const claimed = ref(0);
const maxSlots = ref(FINISH_REWARD_SLOTS);

type StatusSource = "api" | "mock-query" | "local-fallback";
const statusSource = ref<StatusSource>("api");
const statusLoadState = ref<"loading" | "ok" | "error">("loading");
const statusError = ref("");

/** 僅供離線 UI 測試：?mock_claimed=0|1|2|3 覆寫顯示（不寫入 session、不代替後端） */
function effectiveClaimedFromQuery(): number | null {
	const raw = route.query.mock_claimed;
	const s = Array.isArray(raw) ? raw[0] : raw;
	if (s === undefined || s === null || String(s).trim() === "") return null;
	const n = parseInt(String(s), 10);
	if (!Number.isFinite(n)) return null;
	return Math.max(0, Math.min(FINISH_REWARD_SLOTS, n));
}

const isMockPreview = computed(() => effectiveClaimedFromQuery() !== null);

async function loadClaimPresentation() {
	const mock = effectiveClaimedFromQuery();
	if (mock !== null) {
		claimed.value = mock;
		maxSlots.value = FINISH_REWARD_SLOTS;
		statusSource.value = "mock-query";
		statusLoadState.value = "ok";
		statusError.value = "";
		return;
	}

	const base = getViteApiBase();

	if (base) {
		statusLoadState.value = "loading";
		statusError.value = "";
		try {
			const s = await fetchRewardClaimStatus();
			claimed.value = s.claimedCount;
			maxSlots.value = s.maxSlots;
			statusSource.value = "api";
			statusLoadState.value = "ok";
		} catch (e) {
			statusSource.value = "api";
			statusLoadState.value = "error";
			statusError.value =
				e instanceof Error ? e.message : "無法載入領獎狀態";
		}
		return;
	}

	claimed.value = getFinishClaimedCount();
	maxSlots.value = FINISH_REWARD_SLOTS;
	statusSource.value = "local-fallback";
	statusLoadState.value = "ok";
	statusError.value = "";
}

onMounted(() => {
	const p = getProfile();
	name.value = p.name || "夥伴";
	employeeId.value = p.employeeId || "—";
	void loadClaimPresentation();
});

watch(
	() => route.query.mock_claimed,
	() => {
		void loadClaimPresentation();
	},
);

function retryLoadStatus() {
	void loadClaimPresentation();
}

const userLine = computed(() => {
	const id = employeeId.value.trim();
	if (!id || id === "—") return name.value;
	return `${name.value}（${id}）`;
});

function slotActive(index: number): boolean {
	return claimed.value > index;
}

const slotLabels = computed(() => {
	const c = claimed.value;
	const cap = maxSlots.value;
	const third = c >= cap ? "已領滿" : "終點站";
	return [
		c >= 1 ? "已領取" : "待領取",
		c >= 2 ? "已領取" : "待領取",
		third,
	] as const;
});
</script>

<template>
	<div class="flex min-h-full flex-col bg-gw-sand">
		<main class="flex flex-1 flex-col px-5 pb-10 pt-8 sm:mx-auto sm:max-w-md sm:w-full">
			<!-- 慶祝卡 -->
			<div
				class="overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-[#ebe8e0] shadow-card-sm"
			>
				<div
					class="bg-gradient-to-r from-gw-forest to-gw-brand px-4 py-3 text-center shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
				>
					<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
						CELEBRATION TIME!
					</p>
				</div>
				<div class="relative px-4 pb-5 pt-5">
					<div
						class="overflow-hidden rounded-2xl border border-gw-brand/15 bg-[#f5f0e8] shadow-sm ring-1 ring-black/[0.04]"
					>
						<img
							:src="CLAIM_SUCCESS_STICKER_SRC"
							width="1200"
							height="900"
							alt="領取成功：禮物與自然慶祝元素"
							class="aspect-[4/3] h-auto w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					</div>
					<div class="mt-4 flex justify-center">
						<button
							type="button"
							class="rounded-full bg-[#e85d04] px-8 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
							@click="router.push({ name: 'welcome' })"
						>
							Continue
						</button>
					</div>
				</div>
			</div>

			<h1 class="mt-10 text-center font-display text-2xl font-bold text-gw-forest sm:text-[1.65rem]">
				領取成功
			</h1>
			<p class="mt-3 text-center text-base font-bold text-gw-navy">
				{{ userLine }}
			</p>
			<p class="mx-auto mt-4 max-w-[22rem] text-center text-sm leading-relaxed text-neutral-600">
				兌換完成，感謝您參與瑞軒科技2026家庭日，祝您擁有美好的一天。
			</p>

			<section class="mt-10">
				<p
					v-if="isMockPreview"
					class="mb-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-[11px] text-amber-900/90"
					role="note"
				>
					離線測試：網址參數 <code class="rounded bg-white/80 px-1">mock_claimed</code> 只影響此頁顯示，不代表後端紀錄。
				</p>
				<p
					v-if="statusSource === 'local-fallback'"
					class="mb-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-[11px] text-amber-900/90"
					role="note"
				>
					未設定 <code class="rounded bg-white/80 px-1">VITE_API_BASE</code>：暫以瀏覽器
					<code class="rounded bg-white/80 px-1">sessionStorage</code> 類比領獎次數（僅供預覽／原型），上線請改由後端提供。
				</p>
				<h2 class="text-center text-base font-bold text-[#b45309]">
					闖關禮領取狀態
				</h2>
				<p
					v-if="statusSource === 'api' && statusLoadState === 'ok'"
					class="mx-auto mt-2 max-w-[22rem] text-center text-[11px] leading-relaxed text-neutral-500"
				>
					以下狀態由<strong class="text-gw-navy">伺服器</strong>回傳資料呈現（已領
					<strong class="text-gw-navy">{{ claimed }}／{{ maxSlots }}</strong>
					次）。三格圖示僅為 UI 映射。
				</p>
				<div
					v-if="statusLoadState === 'loading'"
					class="mt-6 text-center text-sm text-neutral-500"
					aria-live="polite"
				>
					載入領獎狀態…
				</div>
				<div
					v-else-if="statusLoadState === 'error'"
					class="mt-6 rounded-xl border border-red-200 bg-red-50/90 px-3 py-3 text-center text-[12px] text-red-900"
					role="alert"
				>
					<p>{{ statusError }}</p>
					<button
						type="button"
						class="mt-2 text-[11px] font-semibold text-gw-brand underline underline-offset-2"
						@click="retryLoadStatus"
					>
						重試
					</button>
				</div>
				<div
					v-if="statusLoadState === 'ok'"
					class="mt-6 flex justify-between gap-2 px-1"
				>
					<div
						v-for="(label, i) in slotLabels"
						:key="i"
						class="flex flex-1 flex-col items-center"
					>
						<div
							:class="[
								'flex h-14 w-14 items-center justify-center rounded-full text-xl transition',
								slotActive(i)
									? 'bg-[#fecaca] text-[#78350f] shadow-sm ring-2 ring-white'
									: 'bg-neutral-200/90 text-neutral-500',
							]"
							aria-hidden="true"
						>
							🎁
						</div>
						<p class="mt-2 text-center text-[11px] font-semibold text-gw-navy/85">
							{{ label }}
						</p>
					</div>
				</div>
			</section>
		</main>

		<AppFooter class="mt-auto" />
	</div>
</template>
