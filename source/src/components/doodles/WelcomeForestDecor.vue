<script setup lang="ts">
/**
 * 首頁專用：手繪線條風森林與小動物（SVG），比全站 PageCritters 稍明顯、色彩更豐富。
 */
</script>

<template>
	<div
		class="pointer-events-none absolute inset-0 z-[1] overflow-hidden select-none"
		aria-hidden="true"
	>
		<!-- 左上：小鳥與枝 -->
		<svg
			class="gw-decor-drift gw-decor-drift--a absolute left-0 top-[14%] h-16 w-20 text-[#2d6a4f] opacity-[0.42] sm:left-[2%] sm:top-[16%]"
			viewBox="0 0 80 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				d="M4 40c12-8 28-6 36 4M8 44c10-4 22-2 30 4"
			/>
			<path
				fill="#95d5b2"
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
				d="M52 18c8-2 14 4 12 12-1 6-8 10-14 8-4-2-6-8-4-14 2-4 6-6 6-6z"
			/>
			<circle cx="58" cy="22" r="1.8" fill="currentColor" />
			<path stroke="#f4a261" stroke-width="2" stroke-linecap="round" d="M66 24l8 2" />
		</svg>

		<!-- 右上：松樹 -->
		<svg
			class="gw-decor-drift gw-decor-drift--b absolute -right-1 top-[8%] h-28 w-20 text-[#1b4332] opacity-[0.38] sm:right-[1%]"
			viewBox="0 0 64 96"
			fill="none"
		>
			<path stroke="#8b6914" stroke-width="2.5" stroke-linecap="round" d="M32 88V52" />
			<path
				fill="#52b788"
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
				d="M32 8L14 38h36L32 8zM32 28L18 52h28L32 28zM32 44L22 68h20L32 44z"
			/>
		</svg>

		<!-- 左中：小兔 -->
		<svg
			class="absolute -left-2 top-[42%] h-20 w-16 text-[#2d6a4f] opacity-[0.4] sm:left-0"
			viewBox="0 0 56 72"
			fill="none"
		>
			<path
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				d="M22 10L18 32M34 8l4 26"
			/>
			<ellipse cx="28" cy="48" rx="14" ry="13" fill="#d8f3dc" stroke="currentColor" stroke-width="2.2" />
			<circle cx="24" cy="44" r="2" fill="currentColor" />
			<circle cx="32" cy="44" r="2" fill="currentColor" />
			<path
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M14 50c-6 6-4 14 4 14M40 52c8 4 10 12 2 14"
			/>
		</svg>

		<!-- 右中：小鹿 -->
		<svg
			class="absolute -right-3 top-[38%] h-24 w-20 text-[#6b4423] opacity-[0.4] sm:right-0"
			viewBox="0 0 72 80"
			fill="none"
		>
			<path stroke="#4a3728" stroke-width="1.8" stroke-linecap="round" d="M28 16l-6-12M36 14V2M44 16l6-10" />
			<ellipse cx="36" cy="36" rx="12" ry="11" fill="#e9c46a" stroke="currentColor" stroke-width="2" />
			<ellipse cx="36" cy="52" rx="10" ry="8" fill="#e9c46a" stroke="currentColor" stroke-width="2" />
			<path
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M22 40l-8 16M50 38l8 14M28 58l-4 14M44 58l4 14"
			/>
			<circle cx="32" cy="34" r="1.8" fill="#2d6a4f" />
			<circle cx="40" cy="34" r="1.8" fill="#2d6a4f" />
		</svg>

		<!-- 蝴蝶（標題右側） -->
		<svg
			class="gw-decor-drift gw-decor-drift--c absolute right-[8%] top-[26%] h-12 w-12 text-[#40916c] opacity-[0.45]"
			viewBox="0 0 48 48"
			fill="none"
		>
			<path
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M24 8v32M24 16c-10-8-18 0-14 10s12 8 14 0M24 16c10-8 18 0 14 10s-12 8-14 0"
			/>
			<path stroke="#f4a261" stroke-width="1.8" stroke-linecap="round" d="M22 38q2 5 4 0" />
		</svg>

		<!-- 左下：灌木與蘑菇 -->
		<svg
			class="absolute bottom-[20%] left-1 h-20 w-24 text-[#2d6a4f] opacity-[0.36] sm:bottom-[18%] sm:left-3"
			viewBox="0 0 96 72"
			fill="none"
		>
			<path
				fill="#74c69d"
				stroke="currentColor"
				stroke-width="2"
				stroke-linejoin="round"
				d="M8 56c4-16 20-20 32-12 8 6 12 18 4 24H8V56z"
			/>
			<path
				fill="#95d5b2"
				stroke="currentColor"
				stroke-width="2"
				d="M48 48c6-12 22-10 28 2 4 8-2 18-12 18H48V48z"
			/>
			<path stroke="#8b4513" stroke-width="2" stroke-linecap="round" d="M72 58v10" />
			<path
				fill="#e76f51"
				stroke="#c1121f"
				stroke-width="1.5"
				d="M66 52c0-6 6-10 12-8 4 2 6 8 2 12-4 4-10 2-14-4z"
			/>
		</svg>

		<!-- 右下：圓樹與落葉 -->
		<svg
			class="absolute bottom-[16%] right-0 h-24 w-20 text-[#1b4332] opacity-[0.35] sm:right-2"
			viewBox="0 0 72 88"
			fill="none"
		>
			<path stroke="#6b4423" stroke-width="2.5" stroke-linecap="round" d="M36 80V48" />
			<circle cx="36" cy="32" r="22" fill="#52b788" stroke="currentColor" stroke-width="2.2" />
			<path
				stroke="#40916c"
				stroke-width="1.8"
				stroke-linecap="round"
				d="M20 68l4 6M52 66l-3 8M36 72v8"
			/>
		</svg>

		<!-- 飄葉點綴 -->
		<svg
			class="gw-decor-drift gw-decor-drift--d absolute left-[35%] top-[32%] h-8 w-8 text-[#52b788] opacity-[0.5]"
			viewBox="0 0 32 32"
			fill="none"
		>
			<path
				fill="#b7e4c7"
				stroke="currentColor"
				stroke-width="1.5"
				d="M16 4c-8 8-10 18-2 22 6 3 14-2 14-12 0-8-6-12-12-10z"
			/>
		</svg>
		<svg
			class="absolute right-[25%] top-[48%] h-6 w-6 rotate-12 text-[#74c69d] opacity-[0.45]"
			viewBox="0 0 32 32"
			fill="none"
		>
			<path
				fill="#d8f3dc"
				stroke="currentColor"
				stroke-width="1.4"
				d="M16 3C8 12 6 20 14 24c6 3 12-4 10-14C22 4 16 3 16 3z"
			/>
		</svg>

		<!-- 底部草地線 -->
		<svg
			class="absolute bottom-0 left-0 right-0 h-8 text-[#40916c] opacity-[0.25]"
			viewBox="0 0 400 32"
			preserveAspectRatio="none"
			fill="none"
		>
			<path
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M0 24c20-8 40-4 60 2s50 4 70-2 50-6 80 0 60 8 100-4 130 2"
			/>
			<path
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				opacity="0.7"
				d="M10 28c15-4 35 0 50 4M200 26c30-6 55 2 80 6"
			/>
		</svg>
	</div>
</template>

<style scoped>
.gw-decor-drift {
	animation: gw-decor-float 6s ease-in-out infinite alternate;
}

.gw-decor-drift--a {
	animation-duration: 5.5s;
	animation-delay: -0.8s;
}

.gw-decor-drift--b {
	animation-duration: 7s;
	animation-delay: -2.2s;
}

.gw-decor-drift--c {
	animation-duration: 4.2s;
	animation-delay: -1.4s;
}

.gw-decor-drift--d {
	animation-duration: 5s;
	animation-delay: -3s;
}

@keyframes gw-decor-float {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(-4px);
	}
}

@media (prefers-reduced-motion: reduce) {
	.gw-decor-drift {
		animation: none;
	}
}
</style>
