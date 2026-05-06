<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function next() {
	router.push({ name: "checkin" });
}
</script>

<template>
	<div class="relative flex min-h-screen flex-col overflow-hidden">
		<!-- 背景圖 -->
		<img
			src="/images/enroll-welcome.jpg"
			alt="瑞軒科技2026家庭日報到歡迎畫面"
			class="absolute inset-0 h-full w-full object-cover object-top"
			loading="eager"
			fetchpriority="high"
		/>
		<!-- 底部漸層遮罩，確保按鈕可讀性 -->
		<div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
		<!-- 按鈕區 -->
		<div class="relative z-[1] flex min-h-screen flex-col justify-end px-5 pb-10">
			<button
				type="button"
				class="flex w-full items-center justify-center gap-2 rounded-full bg-[#2B5038] py-4 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
				@click="next"
			>
				開始探索
				<span aria-hidden="true">›</span>
			</button>
		</div>
	</div>
</template>
