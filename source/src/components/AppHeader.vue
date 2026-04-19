<script setup lang="ts">
import { computed } from "vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { getProfile } from "@/lib/demoState";
import { useI18n } from "@/composables/useI18n";
import { GAME_CONFIG } from "@/constants";

const props = withDefaults(
	defineProps<{
		/** 目前要挑戰的站點 1–6（用於推算已完成站數） */
		stage?: number;
		/** 若設定則覆寫進度數字（例如完成頁固定顯示 6/6） */
		completedOverride?: number | null;
		showProgress?: boolean;
		showUser?: boolean;
	}>(),
	{
		stage: 1,
		completedOverride: null,
		showProgress: false,
		showUser: true,
	},
);

const { t } = useI18n();
const profile = computed(() => getProfile());
const showProfile = computed(
	() => props.showUser && profile.value.name.length > 0,
);

const completed = computed(() => {
	if (props.completedOverride != null) {
		return Math.max(
			0,
			Math.min(GAME_CONFIG.TOTAL_STAGES, props.completedOverride),
		);
	}
	return Math.max(
		0,
		Math.min(GAME_CONFIG.TOTAL_STAGES, props.stage - 1),
	);
});

const progressPct = computed(
	() => (completed.value / GAME_CONFIG.TOTAL_STAGES) * 100,
);
</script>

<template>
	<header
		class="shrink-0 border-b border-neutral-200/70 bg-white/92 px-4 py-3.5 shadow-[0_1px_0_rgba(15,31,46,0.06),0_8px_24px_-8px_rgba(26,157,74,0.06)] backdrop-blur-md"
	>
		<div class="flex items-start gap-3">
			<BrandLogo size="sm" />
			<div class="min-w-0 flex-1">
				<p
					class="font-display text-[0.95rem] font-bold leading-tight tracking-tight text-gw-navy sm:text-base"
				>
					{{ t("header.title") }}
				</p>
				<p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
					{{ t("header.subtitle") }}
				</p>
			</div>
			<div v-if="showProfile || showProgress" class="flex shrink-0 flex-col items-end gap-2.5 text-right">
				<div v-if="showProfile" class="flex max-w-[11rem] items-center gap-2 rounded-full bg-gw-mint/40 py-1 pl-1 pr-2.5 ring-1 ring-gw-mint-soft/60">
					<span
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs text-gw-brand shadow-sm ring-1 ring-gw-mint-soft/50"
						aria-hidden="true"
						>👤</span
					>
					<span class="truncate text-xs font-semibold text-gw-navy">{{ profile.name }}</span>
				</div>
				<div v-if="showProgress" class="w-40">
					<div class="flex items-center justify-end gap-2 text-[10px] font-bold text-gw-navy">
							<span id="gw-progress-label" class="text-neutral-400">{{
								t("header.progressLabel")
							}}</span>
						<span class="tabular-nums text-gw-brand">
							{{ completed }}/{{ GAME_CONFIG.TOTAL_STAGES }}
						</span>
					</div>
					<div
						class="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-200/90 p-[3px] shadow-inner ring-1 ring-black/[0.04]"
						role="progressbar"
						:aria-valuenow="completed"
						aria-valuemin="0"
						:aria-valuemax="GAME_CONFIG.TOTAL_STAGES"
						aria-labelledby="gw-progress-label"
					>
						<div
							class="h-full rounded-full bg-gradient-to-r from-gw-brand via-emerald-400 to-teal-500 shadow-sm transition-[width] duration-500 ease-gw-smooth"
							:style="{ width: `${progressPct}%` }"
						/>
					</div>
				</div>
			</div>
		</div>
	</header>
</template>
