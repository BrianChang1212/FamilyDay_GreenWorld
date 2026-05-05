<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import PageCritters from "@/components/doodles/PageCritters.vue";

const route = useRoute();
</script>

<template>
	<div
		class="relative box-border flex min-h-dvh flex-col bg-gw-page
			pt-[max(0.5rem,env(safe-area-inset-top,0px))]
			pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]
			pl-[max(0.5rem,env(safe-area-inset-left,0px))]
			pr-[max(0.5rem,env(safe-area-inset-right,0px))]"
	>
		<PageCritters variant="viewport" />

		<!-- 主卡片：寬高約 90% 視窗，隨螢幕縮放；內部 gw-scroll 負責捲動 -->
		<div
			class="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center py-[max(0.25rem,calc((100dvh-90dvh)/2))] sm:px-[max(0.5rem,calc((100vw-90vw)/2))]"
		>
			<div
				class="box-border flex w-[min(90vw,42rem)] min-h-0 flex-none flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-card-lg ring-1 ring-gw-brand/[0.07] ring-offset-0 sm:w-[min(90vw,48rem)] sm:rounded-3xl
					h-[min(90dvh,90svh)]
					max-h-[min(90dvh,90svh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-0.5rem))]"
			>
				<div class="gw-scroll">
					<RouterView v-slot="{ Component }">
						<Transition name="gw-route" mode="out-in">
							<component
								:is="Component"
								:key="route.fullPath"
								class="flex min-h-full min-w-0 w-full shrink-0 flex-col"
							/>
						</Transition>
					</RouterView>
				</div>
			</div>
		</div>
	</div>
</template>
