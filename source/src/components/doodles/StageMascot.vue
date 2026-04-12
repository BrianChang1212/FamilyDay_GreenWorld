<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		stage: number;
		size?: "xs" | "sm" | "md" | "lg";
	}>(),
	{ size: "md" },
);

const n = computed(() => {
	const s = Math.round(props.stage);
	return s >= 1 && s <= 6 ? s : 1;
});

const dim = computed(() => {
	if (props.size === "xs") return "h-8 w-8";
	if (props.size === "sm") return "h-11 w-11";
	if (props.size === "lg") return "h-20 w-20";
	return "h-14 w-14";
});

const stroke = "#1a6b45";
const strokeW = "2.4";
const soft = "#4ade80";
</script>

<template>
	<div
		:class="['shrink-0 text-gw-brand', dim]"
		role="img"
		:aria-label="`關卡 ${n} 小夥伴`"
	>
		<!-- 1 天鵝湖：小天鵝 -->
		<svg
			v-if="n === 1"
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M14 46c4-18 18-26 32-22 8 2 14 10 12 20-2 12-16 18-28 16-8-1-14-6-16-14"
			/>
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				d="M46 28c6-8 16-10 22-4 3 3 2 8-2 10"
			/>
			<path stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" d="M56 36l10-3" />
			<circle cx="38" cy="34" r="2" :fill="stroke" />
		</svg>

		<!-- 2 青青草原：小兔 -->
		<svg
			v-else-if="n === 2"
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M34 18l-4 22M46 16l2 24"
			/>
			<ellipse cx="40" cy="48" rx="18" ry="16" :stroke="stroke" :stroke-width="strokeW" />
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				d="M28 52c-8 4-10 12-6 16 4 4 12 2 14-4"
			/>
			<circle cx="34" cy="44" r="2.2" :fill="stroke" />
			<circle cx="46" cy="44" r="2.2" :fill="stroke" />
			<path :stroke="soft" stroke-width="2" stroke-linecap="round" d="M38 50q2 3 6 1" />
		</svg>

		<!-- 3 森林小徑：小鹿 -->
		<svg
			v-else-if="n === 3"
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				:stroke="stroke"
				:stroke-width="2"
				stroke-linecap="round"
				d="M32 22l-4-8M40 20l0-10M48 22l4-7"
			/>
			<ellipse cx="40" cy="36" rx="14" ry="12" :stroke="stroke" :stroke-width="strokeW" />
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M26 40c-10 8-8 22 4 24 6 1 12-2 14-8M54 38c8 6 10 18 2 22"
			/>
			<circle cx="36" cy="34" r="2" :fill="stroke" />
			<circle cx="44" cy="34" r="2" :fill="stroke" />
		</svg>

		<!-- 4 松鼠之家：松鼠與大尾巴 -->
		<svg
			v-else-if="n === 4"
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M48 20c18 4 22 28 10 42-8 10-24 8-30-4"
			/>
			<ellipse cx="34" cy="44" rx="16" ry="14" :stroke="stroke" :stroke-width="strokeW" />
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				d="M20 42c-6 8-4 18 6 20M42 36l8-6"
			/>
			<circle cx="30" cy="40" r="2.2" :fill="stroke" />
			<circle cx="38" cy="40" r="2.2" :fill="stroke" />
		</svg>

		<!-- 5 昆蟲飯店：小蜜蜂 -->
		<svg
			v-else-if="n === 5"
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				:stroke="soft"
				stroke-width="2"
				stroke-linecap="round"
				opacity="0.7"
				d="M18 38c8-10 20-8 24 2M58 36c-6-10-18-8-22 2"
			/>
			<ellipse cx="40" cy="48" rx="20" ry="14" :stroke="stroke" :stroke-width="strokeW" />
			<path
				stroke="#ca8a04"
				stroke-width="2.2"
				stroke-linecap="round"
				d="M26 46h28M28 52h24"
			/>
			<circle cx="52" cy="44" r="2.5" :fill="stroke" />
		</svg>

		<!-- 6 終點舞台：戴派對帽的小鳥 -->
		<svg
			v-else
			class="h-full w-full drop-shadow-sm"
			viewBox="0 0 80 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke="#f59e0b"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="#fef3c7"
				d="M36 14l8 16-10-4-10 4 8-16z"
			/>
			<circle cx="28" cy="12" r="2" fill="#f472b6" />
			<circle cx="48" cy="10" r="2" fill="#60a5fa" />
			<ellipse cx="40" cy="42" rx="20" ry="16" :stroke="stroke" :stroke-width="strokeW" />
			<path
				:stroke="stroke"
				:stroke-width="strokeW"
				stroke-linecap="round"
				d="M18 40c-8 2-10 12-2 14M58 38c10 4 8 16-2 14"
			/>
			<circle cx="34" cy="38" r="2.2" :fill="stroke" />
			<circle cx="46" cy="38" r="2.2" :fill="stroke" />
			<path :stroke="soft" stroke-width="2" stroke-linecap="round" d="M36 48q4 3 8 0" />
		</svg>
	</div>
</template>
