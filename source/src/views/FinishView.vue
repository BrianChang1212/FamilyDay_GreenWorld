<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import {
	LEVEL_COMPLETE_STICKER_SRC,
	getProfile,
	getStage,
} from "@/lib/demoState";
import { incrementLocalFinishClaimIfNoApiBase } from "@/lib/provisionalFinishClaim";
import { useI18n } from "@/composables/useI18n";
import { GAME_CONFIG } from "@/constants";

const router = useRouter();
const { t } = useI18n();
const stage = ref(GAME_CONFIG.TOTAL_STAGES);
const name = ref("");
const showClaimModal = ref(false);

onMounted(() => {
	stage.value = getStage();
	name.value = getProfile().name || t("finish.fallbackName");
});

function openClaimModal() {
	showClaimModal.value = true;
}

function closeClaimModal() {
	showClaimModal.value = false;
}

function confirmClaim() {
	showClaimModal.value = false;
	/** 領取紀錄以後端為準；僅在未設定 API 的開發原型用 session 類比 */
	incrementLocalFinishClaimIfNoApiBase();
	// 上線後於此呼叫核銷／領獎 API，成功後再導向 finishClaimSuccess
	router.push({ name: "finishClaimSuccess" });
}

function goHome() {
	router.push({ name: "welcome" });
}
</script>

<template>
	<div class="relative flex min-h-full flex-col bg-[#f5f6f4]">
		<AppHeader
			class="relative z-[2]"
			:stage="stage"
			:completed-override="GAME_CONFIG.TOTAL_STAGES"
			show-progress
			show-user
		/>

		<main class="relative z-[2] flex flex-1 flex-col px-4 pb-6 pt-4 sm:mx-auto sm:max-w-md sm:w-full">
			<div class="rounded-2xl bg-gw-brand px-4 py-4 text-center shadow-md">
				<p class="text-xs font-bold uppercase tracking-wider text-white/90">
					{{ t("finish.bannerTitle") }}
				</p>
				<p class="mt-1 font-display text-xl font-bold text-white">
					{{ t("finish.title") }}
				</p>
			</div>

			<div
				class="mt-6 overflow-hidden rounded-3xl border border-gw-brand/15 bg-[#f5f0e8] shadow-card-sm ring-1 ring-black/[0.04]"
			>
				<img
					:src="LEVEL_COMPLETE_STICKER_SRC"
					width="1200"
					height="900"
					:alt="t('finish.imageAlt')"
					class="aspect-[4/3] h-auto w-full object-cover object-center"
					loading="lazy"
					decoding="async"
				/>
			</div>

			<p class="mt-8 text-center text-base font-bold leading-relaxed text-gw-navy">
				{{ t("finish.completeMessage", { name }) }}
			</p>

			<div class="mt-auto flex flex-col gap-3 pt-10">
				<button
					type="button"
					class="w-full rounded-full bg-[#1a5f2a] py-4 text-base font-bold text-white shadow-lg transition hover:brightness-110"
					@click="openClaimModal"
				>
					{{ t("finish.claimButton") }}
				</button>
				<button
					type="button"
					class="w-full rounded-full border-2 border-[#1a5f2a] bg-white py-3.5 text-base font-bold text-[#1a5f2a] transition hover:bg-neutral-50"
					@click="goHome"
				>
					{{ t("finish.backHomeButton") }}
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />

		<Teleport to="body">
			<div
				v-if="showClaimModal"
				class="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 px-5 backdrop-blur-[2px]"
				role="dialog"
				aria-modal="true"
				aria-labelledby="finish-claim-modal-title"
				@click.self="closeClaimModal"
			>
				<div
					class="w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
					@click.stop
				>
					<div
						class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gw-mint text-3xl"
						aria-hidden="true"
					>
						🎁
					</div>
					<h2 id="finish-claim-modal-title" class="mt-4 text-center text-lg font-bold text-gw-navy">
						{{ t("finish.modalTitle") }}
					</h2>
					<p class="mt-2 text-center text-sm text-neutral-600">
						{{ t("finish.modalMessage") }}
					</p>
					<div class="mt-6 flex flex-col gap-2">
						<button
							type="button"
							class="w-full rounded-full bg-gw-brand py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110"
							@click="confirmClaim"
						>
							{{ t("common.confirm") }}
						</button>
						<button
							type="button"
							class="w-full rounded-full border-2 border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
							@click="closeClaimModal"
						>
							{{ t("common.cancel") }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
