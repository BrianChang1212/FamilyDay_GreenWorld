<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function next() {
	router.push({ name: "checkin" });
}
</script>

<template>
	<div class="flex min-h-screen flex-col bg-[#2B5038]">
		<!-- 插圖：等比例縮放，填滿寬度 -->
		<img
			src="/images/enroll-welcome.png"
			alt="瑞軒科技2026家庭日報到歡迎畫面"
			class="w-full h-auto"
			loading="eager"
			fetchpriority="high"
		/>
		<!-- 按鈕區：深綠底色填滿剩餘空間，按鈕靠底 -->
		<div class="flex flex-1 flex-col justify-end px-5 pb-10 pt-4">
			<button
				type="button"
				class="flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-base font-bold text-[#2B5038] shadow-lg transition hover:brightness-95 active:scale-[0.99]"
				@click="next"
			>
				開始探索
				<span aria-hidden="true">›</span>
			</button>
		</div>
	</div>
</template>
