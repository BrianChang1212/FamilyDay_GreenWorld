<script setup lang="ts">
/**
 * 遊戲說明頁淺色區：手繪可愛動物群像，圍繞中央掃描區，不阻擋操作。
 */
</script>

<template>
	<div
		class="pointer-events-none absolute inset-0 z-0 overflow-visible select-none"
		aria-hidden="true"
	>
		<!-- 左上：兔兔與刺蝟好朋友 -->
		<svg
			class="absolute left-0 top-[6%] h-[4.5rem] w-[5.5rem] text-[#2d6a4f] opacity-[0.48] sm:left-[2%] sm:top-[8%]"
			viewBox="0 0 88 72"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<ellipse cx="32" cy="48" rx="16" ry="14" fill="#d8f3dc" stroke="currentColor" stroke-width="2.2" />
			<path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M22 22l-4 18M30 20l2 20" />
			<circle cx="28" cy="44" r="1.8" fill="currentColor" />
			<circle cx="36" cy="44" r="1.8" fill="currentColor" />
			<path
				fill="#c9ada7"
				stroke="#6b4423"
				stroke-width="2"
				stroke-linejoin="round"
				d="M52 52c8-10 22-8 26 4 2 8-4 14-12 12-8 0-14-8-14-16z"
			/>
			<circle cx="62" cy="48" r="2" fill="#2d6a4f" />
			<path stroke="#6b4423" stroke-width="1.8" stroke-linecap="round" d="M58 40l-4-8M66 38l2-8" />
		</svg>

		<!-- 右上：雙鳥並肩 -->
		<svg
			class="absolute right-0 top-[4%] h-16 w-24 text-[#1b4332] opacity-[0.44] sm:right-[1%]"
			viewBox="0 0 96 56"
			fill="none"
		>
			<path
				fill="#95d5b2"
				stroke="currentColor"
				stroke-width="2"
				d="M20 36c-8-12 4-22 14-18 6 2 10 10 8 18-2 8-10 12-18 10-4-2-6-6-4-10z"
			/>
			<circle cx="26" cy="28" r="1.6" fill="currentColor" />
			<path stroke="#f4a261" stroke-width="1.8" stroke-linecap="round" d="M34 30l8 2" />
			<path
				fill="#b7e4c7"
				stroke="currentColor"
				stroke-width="2"
				d="M56 34c-6-14 10-24 20-16 8 6 8 18 0 24-8 6-18 4-22-4-2-4-2-8 2-4z"
			/>
			<circle cx="64" cy="26" r="1.6" fill="currentColor" />
			<path stroke="#f4a261" stroke-width="1.8" stroke-linecap="round" d="M72 28l10 0" />
		</svg>

		<!-- 左下：松鼠與香菇小隊 -->
		<svg
			class="absolute bottom-[28%] left-0 h-[5rem] w-[5.5rem] text-[#6b4423] opacity-[0.46] sm:bottom-[26%] sm:left-1"
			viewBox="0 0 88 80"
			fill="none"
		>
			<path
				fill="#d4a574"
				stroke="currentColor"
				stroke-width="2"
				d="M12 48c6-18 28-20 36-6 4 8 2 20-8 24-10 4-22-2-26-14-2-6 0-12-2-4z"
			/>
			<path
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M40 36c10-8 18-2 16 8M18 50l-8 10"
			/>
			<circle cx="24" cy="44" r="1.8" fill="#2d6a4f" />
			<path stroke="#8b4513" stroke-width="1.6" stroke-linecap="round" d="M52 58v10" />
			<path
				fill="#e76f51"
				stroke="#c1121f"
				stroke-width="1.4"
				d="M48 50c0-5 6-9 12-6 4 2 6 8 2 12-4 4-10 2-14-6z"
			/>
			<path stroke="#8b4513" stroke-width="1.6" stroke-linecap="round" d="M68 62v8" />
			<path
				fill="#f4a261"
				stroke="#d97706"
				stroke-width="1.4"
				d="M64 54c4-4 10-2 10 4 0 4-4 8-8 6-4-2-4-8-2-10z"
			/>
		</svg>

		<!-- 右下：小鹿與蝴蝶 -->
		<svg
			class="absolute bottom-[26%] right-0 h-[5.2rem] w-[4.8rem] text-[#6b4423] opacity-[0.44] sm:right-1"
			viewBox="0 0 76 84"
			fill="none"
		>
			<path stroke="#4a3728" stroke-width="1.6" stroke-linecap="round" d="M28 18l-5-12M38 16V4M48 18l6-10" />
			<ellipse cx="38" cy="36" rx="11" ry="10" fill="#e9c46a" stroke="currentColor" stroke-width="2" />
			<ellipse cx="38" cy="52" rx="9" ry="8" fill="#e9c46a" stroke="currentColor" stroke-width="2" />
			<path
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				d="M26 40l-6 14M50 38l6 12M30 56l-3 12M46 56l3 12"
			/>
			<circle cx="34" cy="34" r="1.6" fill="#2d6a4f" />
			<circle cx="42" cy="34" r="1.6" fill="#2d6a4f" />
			<path
				stroke="#40916c"
				stroke-width="1.8"
				stroke-linecap="round"
				d="M58 22c6-4 12 0 10 8M56 26l-4 6"
			/>
		</svg>

		<!-- 中下方：「大合照」相框感 — 三顆頭擠一起 -->
		<svg
			class="absolute bottom-[8%] left-1/2 h-[5.5rem] w-[13rem] -translate-x-1/2 text-[#2d6a4f] opacity-[0.5] sm:bottom-[10%]"
			viewBox="0 0 208 72"
			fill="none"
		>
			<rect
				x="4"
				y="8"
				width="200"
				height="56"
				rx="10"
				fill="#fefae0"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-dasharray="4 3"
			/>
			<!-- 熊臉 -->
			<circle cx="52" cy="40" r="16" fill="#d4a574" stroke="#6b4423" stroke-width="2" />
			<circle cx="46" cy="36" r="2" fill="#2d6a4f" />
			<circle cx="58" cy="36" r="2" fill="#2d6a4f" />
			<ellipse cx="52" cy="44" rx="4" ry="2.5" fill="#6b4423" opacity="0.35" />
			<!-- 兔兔臉 -->
			<ellipse cx="104" cy="42" rx="14" ry="13" fill="#d8f3dc" stroke="currentColor" stroke-width="2" />
			<path stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M94 22l-3 14M110 20l2 16" />
			<circle cx="98" cy="38" r="1.8" fill="currentColor" />
			<circle cx="110" cy="38" r="1.8" fill="currentColor" />
			<!-- 小雞 -->
			<circle cx="156" cy="40" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
			<path stroke="#d97706" stroke-width="2" stroke-linecap="round" d="M156 22v6" />
			<path fill="#f59e0b" d="M152 34l8 4-8 4v-8z" />
			<circle cx="150" cy="38" r="1.5" fill="#2d6a4f" />
			<circle cx="160" cy="38" r="1.5" fill="#2d6a4f" />
		</svg>

		<!-- 點綴：小青蛙與小蜜蜂 -->
		<svg
			class="absolute left-[22%] top-[38%] h-9 w-9 text-[#40916c] opacity-[0.42]"
			viewBox="0 0 36 36"
			fill="none"
		>
			<ellipse cx="18" cy="22" rx="12" ry="8" fill="#b7e4c7" stroke="currentColor" stroke-width="1.8" />
			<circle cx="12" cy="18" r="5" stroke="currentColor" stroke-width="1.8" />
			<circle cx="24" cy="18" r="5" stroke="currentColor" stroke-width="1.8" />
			<circle cx="12" cy="18" r="1.5" fill="currentColor" />
			<circle cx="24" cy="18" r="1.5" fill="currentColor" />
		</svg>
		<svg
			class="absolute right-[20%] top-[40%] h-8 w-10 text-[#ca8a04] opacity-[0.45]"
			viewBox="0 0 40 32"
			fill="none"
		>
			<ellipse cx="20" cy="18" rx="14" ry="10" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.8" />
			<path stroke="#854d0e" stroke-width="1.6" d="M8 16h22M10 20h18" />
			<path
				stroke="#93c5fd"
				stroke-width="1.4"
				stroke-linecap="round"
				opacity="0.9"
				d="M4 14c4-6 10-4 12 2M32 12c-4-6-10-4-12 2"
			/>
		</svg>
	</div>
</template>
