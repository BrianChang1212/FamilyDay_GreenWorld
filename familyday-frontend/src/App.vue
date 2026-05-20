<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import PageCritters from "@/components/doodles/PageCritters.vue";

const route = useRoute();

/*
 * 路由切換不再包 <Transition>：opacity 過場在部分環境會卡死（畫面恒為透明），
 * 外層白卡片仍在 → 誤判白屏。捲動歸零改由 router/index.ts afterEach + nextTick。
 *
 * route.meta.fullBleed === true 時跳過外層白卡與 safe-area padding，
 * 讓 hero 類視圖（WelcomeView、CheckInWelcomeView）背景直接鋪到 viewport 邊。
 */
const isFullBleed = computed(() => route.meta?.fullBleed === true);
</script>

<template>
	<div
		class="relative box-border flex min-h-dvh flex-col bg-gw-page"
		:class="isFullBleed
			? ''
			: 'pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]'"
	>
		<PageCritters v-if="!isFullBleed" variant="viewport" />

		<!-- fullBleed：跳過白卡與 padding，背景圖直接鋪滿 viewport -->
		<template v-if="isFullBleed">
			<RouterView v-slot="{ Component }">
				<component
					:is="Component"
					:key="route.fullPath"
					class="flex min-h-dvh min-w-0 w-full flex-1 flex-col"
				/>
			</RouterView>
		</template>

		<!-- 一般頁：包在 90% viewport 的白色圓角卡片內 -->
		<div
			v-else
			class="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center py-[max(0.25rem,calc((100dvh-90dvh)/2))] sm:px-[max(0.5rem,calc((100vw-90vw)/2))]"
		>
			<div
				class="box-border flex w-[min(90vw,42rem)] min-h-0 flex-none flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-card-lg ring-1 ring-gw-brand/[0.07] ring-offset-0 sm:w-[min(90vw,48rem)] sm:rounded-3xl
					h-[min(90dvh,90svh)]
					max-h-[min(90dvh,90svh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-0.5rem))]"
			>
				<div class="gw-scroll">
					<RouterView v-slot="{ Component }">
						<component
							:is="Component"
							:key="route.fullPath"
							class="flex min-h-0 min-w-0 w-full flex-1 flex-col"
						/>
					</RouterView>
				</div>
			</div>
		</div>
	</div>
</template>
