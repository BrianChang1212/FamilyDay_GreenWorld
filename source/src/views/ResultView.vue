<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import StageMascot from "@/components/doodles/StageMascot.vue";
import { getStage, setInZone, setStage } from "@/lib/demoState";
import { getStageQuiz } from "@/lib/stageQuestions";

const route = useRoute();
const router = useRouter();

const ok = computed(() => route.query.ok === "1");

const stage = computed(() => getStage());
const successTip = computed(() => getStageQuiz(stage.value).successTip);

function next() {
	const s = getStage();
	if (ok.value) {
		if (s >= 6) {
			router.push({ name: "finish" });
			return;
		}
		setStage(s + 1);
		setInZone(false);
		router.push({ name: "stage" });
		return;
	}
	router.push({ name: "quiz" });
}
</script>

<template>
	<div class="gw-page-fill relative flex min-h-full flex-col">
		<PageCritters />
		<AppHeader class="relative z-[2]" :stage="stage" show-progress show-user />

		<main class="relative z-[2] flex flex-1 flex-col justify-center px-5 py-8">
			<template v-if="ok">
				<div class="mx-auto flex w-full max-w-sm flex-col items-center text-center">
					<StageMascot :stage="stage" size="lg" class="mb-2 opacity-95 drop-shadow-md" />
					<div
						class="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-gw-mint to-white p-1 shadow-card ring-1 ring-gw-brand/25"
					>
						<div
							class="absolute inset-0 rounded-3xl bg-gradient-to-t from-gw-brand/10 to-transparent"
							aria-hidden="true"
						/>
						<div
							class="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gw-cta text-3xl font-bold text-white shadow-btn-lg ring-2 ring-white/40"
						>
							✓
						</div>
					</div>
					<h1
						class="mt-8 bg-gradient-to-r from-gw-brand to-gw-forest bg-clip-text text-2xl font-bold tracking-tight text-transparent"
					>
						太優秀了！
					</h1>
					<p class="mt-3 text-sm leading-relaxed text-neutral-600">
						你對大自然的觀察力簡直完美，成功完成這一關挑戰！
					</p>

					<div
						class="gw-surface mt-8 w-full p-4 text-left shadow-card-sm ring-gw-mint/25"
					>
						<div class="flex items-center gap-2 text-sm font-bold text-gw-brand">
							<span class="text-base" aria-hidden="true">💡</span>
							小知識時間
						</div>
						<p class="mt-2 text-sm leading-relaxed text-neutral-700">
							{{ successTip }}
						</p>
					</div>
				</div>
			</template>

			<template v-else>
				<div class="mx-auto flex w-full max-w-sm flex-col items-center text-center">
					<StageMascot :stage="stage" size="sm" class="mb-3 opacity-40 grayscale" />
					<div
						class="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-white p-1 shadow-card ring-1 ring-red-100"
					>
						<div
							class="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[#d32f2f] to-[#b71c1c] text-3xl font-bold text-white shadow-lg ring-1 ring-white/25"
						>
							✕
						</div>
					</div>
					<h1 class="mt-8 text-2xl font-bold tracking-tight text-[#b71c1c]">哎呀答錯了</h1>
					<p class="mt-3 text-sm leading-relaxed text-neutral-600">
						沒關係，大自然還有很多奧秘等著你探索！再試一次吧。
					</p>
				</div>
			</template>

			<div class="mx-auto mt-10 w-full max-w-sm">
				<button type="button" class="gw-btn-primary gw-btn-primary--pill" @click="next">
					<template v-if="ok">前往下一站 →</template>
					<template v-else>再試一次</template>
				</button>
			</div>
		</main>

		<AppFooter class="relative z-[2]" />
	</div>
</template>
