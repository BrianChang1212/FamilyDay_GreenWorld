<script setup lang="ts">
/**
 * 手繪風背景小動物／自然元素，低透明度不重搶主內容。
 */
withDefaults(
	defineProps<{
		/** viewport：整區角落；inline：父層需 relative */
		variant?: "viewport" | "inline";
	}>(),
	{ variant: "inline" },
);

const s = "#1a6b45";
const w = "2.2";
</script>

<template>
	<div
		:class="[
			'pointer-events-none select-none text-gw-brand',
			variant === 'viewport'
				? 'absolute inset-0 z-[1] overflow-hidden'
				: 'absolute inset-0 overflow-hidden rounded-[inherit]',
		]"
		aria-hidden="true"
	>
		<!-- 蝴蝶 -->
		<svg
			class="absolute -right-2 top-[8%] h-14 w-14 opacity-[0.14] sm:right-[2%] sm:top-[10%]"
			viewBox="0 0 56 56"
			fill="none"
		>
			<path
				:stroke="s"
				:stroke-width="w"
				stroke-linecap="round"
				d="M28 12v32M28 20c-10-6-18 0-16 10s14 10 16 2M28 20c10-6 18 0 16 10s-14 10-16 2"
			/>
			<path :stroke="s" :stroke-width="w" stroke-linecap="round" d="M26 44q2 6 4 0" />
		</svg>

		<!-- 小蝸牛 -->
		<svg
			class="absolute bottom-[22%] left-1 h-12 w-12 opacity-[0.12] sm:bottom-[18%] sm:left-4"
			viewBox="0 0 48 48"
			fill="none"
		>
			<path
				:stroke="s"
				:stroke-width="w"
				stroke-linecap="round"
				d="M8 32c4-8 14-10 20-4 6 8-2 16-10 14"
			/>
			<circle cx="30" cy="22" r="9" :stroke="s" :stroke-width="w" />
			<path :stroke="s" :stroke-width="w" stroke-linecap="round" d="M10 34c-4 2-4 6 0 6" />
		</svg>

		<!-- 小鴨 -->
		<svg
			class="absolute bottom-[12%] right-2 h-16 w-16 opacity-[0.11] sm:right-6"
			viewBox="0 0 64 64"
			fill="none"
		>
			<ellipse cx="32" cy="38" rx="16" ry="12" :stroke="s" :stroke-width="w" />
			<circle cx="44" cy="34" r="8" :stroke="s" :stroke-width="w" />
			<path stroke="#f59e0b" stroke-width="2" stroke-linecap="round" d="M50 34l8 2" />
			<circle cx="46" cy="32" r="1.8" fill="#1a6b45" />
		</svg>

		<!-- 小魚 -->
		<svg
			class="absolute left-[5%] top-[35%] h-11 w-11 opacity-[0.1] sm:left-[8%]"
			viewBox="0 0 48 48"
			fill="none"
		>
			<path
				:stroke="s"
				:stroke-width="w"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8 24c10-8 22-6 28 0-6 6-18 8-28 0z"
			/>
			<path :stroke="s" :stroke-width="w" stroke-linecap="round" d="M36 24l8-4v8l-8-4" />
		</svg>

		<!-- 小花 -->
		<svg
			class="absolute right-[8%] top-[42%] h-10 w-10 opacity-[0.13]"
			viewBox="0 0 40 40"
			fill="none"
		>
			<circle cx="20" cy="20" r="4" stroke="#16a34a" stroke-width="1.8" />
			<path
				stroke="#22c55e"
				stroke-width="1.8"
				stroke-linecap="round"
				d="M20 12v6M20 22v6M12 20h6M22 20h6M14 14l4 4M22 22l4 4M26 14l-4 4M18 22l-4 4"
			/>
		</svg>

		<!-- 小青蛙剪影 -->
		<svg
			class="absolute left-[12%] top-[58%] h-12 w-12 opacity-[0.09] sm:top-[52%]"
			viewBox="0 0 48 48"
			fill="none"
		>
			<ellipse cx="24" cy="30" rx="14" ry="10" :stroke="s" :stroke-width="w" />
			<circle cx="18" cy="26" r="5" :stroke="s" :stroke-width="w" />
			<circle cx="30" cy="26" r="5" :stroke="s" :stroke-width="w" />
			<circle cx="18" cy="26" r="1.5" fill="#1a6b45" />
			<circle cx="30" cy="26" r="1.5" fill="#1a6b45" />
			<path :stroke="s" :stroke-width="w" stroke-linecap="round" d="M20 34q4 4 8 0" />
		</svg>
	</div>
</template>
