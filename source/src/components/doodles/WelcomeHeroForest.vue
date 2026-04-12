<script setup lang="ts">
/**
 * 首頁中央卡片：完整森林手繪插圖（單一 viewBox，避免裁切）。
 * 動效僅 transform，並尊重 prefers-reduced-motion。
 */
defineOptions({ inheritAttrs: false });
</script>

<template>
	<svg
		v-bind="$attrs"
		class="block h-auto w-full text-[#1b4332]"
		viewBox="0 0 400 248"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<defs>
			<linearGradient id="whf-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#e0f2fe" />
				<stop offset="55%" stop-color="#dbeafe" />
				<stop offset="100%" stop-color="#d8f3dc" />
			</linearGradient>
			<linearGradient id="whf-hill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#95d5b2" />
				<stop offset="100%" stop-color="#74c69d" />
			</linearGradient>
			<linearGradient id="whf-grass" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#b7e4c7" />
				<stop offset="100%" stop-color="#52b788" />
			</linearGradient>
		</defs>

		<!-- 天空 -->
		<rect width="400" height="248" rx="14" fill="url(#whf-sky)" />

		<!-- 太陽 -->
		<g class="whf-sun">
			<circle cx="332" cy="46" r="22" fill="#fde68a" stroke="#f59e0b" stroke-width="2.2" />
			<path
				stroke="#fbbf24"
				stroke-width="2"
				stroke-linecap="round"
				opacity="0.85"
				d="M332 14v8M332 70v8M300 46h8M356 46h8M312 26l6 6M352 66l6 6M358 26l-6 6M318 66l-6 6"
			/>
		</g>

		<!-- 雲 -->
		<g class="whf-clouds" opacity="0.92">
			<path
				fill="#ffffff"
				stroke="#bae6fd"
				stroke-width="1.6"
				d="M48 52c0-10 12-16 22-10 4-10 18-10 24-2 8-6 18 0 18 10 0 10-10 16-22 14H52c-10 0-18-6-18-14 0-4 4-8 14-8z"
			/>
			<path
				fill="#ffffff"
				stroke="#bae6fd"
				stroke-width="1.4"
				opacity="0.9"
				d="M168 38c6-8 18-6 22 2 6-8 20-4 22 6 10-4 18 2 16 12-2 8-12 12-22 10h-46c-8 0-14-6-12-14 2-6 10-10 20-6z"
			/>
		</g>

		<!-- 遠山 -->
		<path
			fill="url(#whf-hill)"
			stroke="#2d6a4f"
			stroke-width="1.8"
			stroke-linejoin="round"
			opacity="0.55"
			d="M0 168c32-18 72-22 108-8 28 10 52 8 80-6 36-20 80-18 120 4 36 18 64 14 92-2v84H0V168z"
		/>
		<path
			fill="#b7e4c7"
			stroke="#40916c"
			stroke-width="1.6"
			stroke-linejoin="round"
			opacity="0.7"
			d="M0 186c40-12 88-10 128 8 32 14 56 12 88-4 40-22 88-20 128 6 20 12 40 14 56 6v52H0V186z"
		/>

		<!-- 後排樹（簡化三角形） -->
		<g stroke="#1b4332" stroke-width="2" stroke-linejoin="round">
			<path fill="#40916c" d="M52 178L40 210h24l-12-32zM64 186L56 210h16l-8-24z" />
			<path fill="#2d6a4f" d="M118 172l-14 38h28l-14-38zM128 182l-10 28h20l-10-28z" />
			<path fill="#52b788" d="M292 170l-16 42h32l-16-42zM306 180l-12 32h24l-12-32z" />
			<path fill="#40916c" d="M338 176l-12 36h24l-12-36z" />
		</g>

		<!-- 圓冠樹 -->
		<g>
			<path stroke="#6b4423" stroke-width="2.4" stroke-linecap="round" d="M92 210V158" />
			<circle cx="92" cy="138" r="26" fill="#52b788" stroke="#1b4332" stroke-width="2" />
			<path stroke="#40916c" stroke-width="1.6" stroke-linecap="round" d="M78 150l-6 8M106 148l6 6" />
		</g>
		<g>
			<path stroke="#6b4423" stroke-width="2.2" stroke-linecap="round" d="M248 212v-48" />
			<circle cx="248" cy="132" r="22" fill="#74c69d" stroke="#1b4332" stroke-width="2" />
		</g>

		<!-- 前排松樹 -->
		<g stroke="#1b4332" stroke-width="2" stroke-linejoin="round">
			<path stroke="#5c4033" stroke-width="2.5" stroke-linecap="round" d="M168 214v-46" />
			<path fill="#2d6a4f" d="M168 108l-22 52h44l-22-52zM168 132l-18 40h36l-18-40zM168 152l-14 30h28l-14-30z" />
			<path stroke="#5c4033" stroke-width="2.5" stroke-linecap="round" d="M200 216v-40" />
			<path fill="#40916c" d="M200 120l-18 48h36l-18-48zM200 142l-14 36h28l-14-36z" />
		</g>

		<!-- 草地帶 -->
		<path
			fill="url(#whf-grass)"
			stroke="#2d6a4f"
			stroke-width="1.6"
			stroke-linejoin="round"
			opacity="0.9"
			d="M0 210c28-6 52-2 76 8 24 10 48 12 72 4s52-10 80-4 56 14 84 10 52-8 88-6v38H0V210z"
		/>
		<path
			stroke="#40916c"
			stroke-width="1.8"
			stroke-linecap="round"
			opacity="0.65"
			d="M12 222c8-4 16-2 22 2M56 224c10-5 20-3 28 2M120 226c12-6 24-4 34 2M200 224c14-6 28-4 40 2M280 222c10-5 22-3 32 2M340 224c8-4 18-2 26 2"
		/>

		<!-- 小蘑菇 -->
		<path stroke="#8b4513" stroke-width="1.8" stroke-linecap="round" d="M42 218v10" />
		<path
			fill="#f4a261"
			stroke="#c2410c"
			stroke-width="1.5"
			d="M42 206c-10 0-14 8-10 12 4 4 16 4 20 0 4-4 0-12-10-12z"
		/>
		<path stroke="#8b4513" stroke-width="1.6" stroke-linecap="round" d="M318 220v8" />
		<path
			fill="#fca5a5"
			stroke="#be123c"
			stroke-width="1.4"
			d="M318 210c-8 0-12 6-8 10 4 4 12 4 16 0 4-4 0-10-8-10z"
		/>

		<!-- 小花 -->
		<g stroke="#ca8a04" stroke-width="1.4" stroke-linecap="round">
			<circle cx="354" cy="218" r="4" fill="#fef08a" />
			<path d="M354 210v16M346 218h16" />
		</g>

		<!-- 小兔（左下） -->
		<g transform="translate(108, 188)">
			<path
				stroke="#2d6a4f"
				stroke-width="2"
				stroke-linecap="round"
				d="M14 4L10 22M26 2l4 22"
			/>
			<ellipse cx="22" cy="34" rx="12" ry="11" fill="#ecfdf5" stroke="#2d6a4f" stroke-width="2" />
			<circle cx="18" cy="30" r="1.8" fill="#1b4332" />
			<circle cx="26" cy="30" r="1.8" fill="#1b4332" />
			<path stroke="#2d6a4f" stroke-width="1.8" stroke-linecap="round" d="M8 38c-4 6-2 12 4 12M34 40c6 4 6 10 0 12" />
		</g>

		<!-- 松鼠（右下木頭上） -->
		<g transform="translate(268, 196)">
			<path stroke="#5c4033" stroke-width="2" stroke-linecap="round" d="M-4 28h36" />
			<path
				fill="#d4a574"
				stroke="#6b4423"
				stroke-width="1.8"
				stroke-linejoin="round"
				d="M4 24c2-10 16-12 22-4 2 4 2 10-2 12-6 4-14 2-18-4-2-4-2-6-2-4z"
			/>
			<path
				stroke="#6b4423"
				stroke-width="1.8"
				stroke-linecap="round"
				d="M22 16c6-4 12-2 10 4M10 26l-6 8"
			/>
			<circle cx="12" cy="22" r="1.5" fill="#1b4332" />
		</g>

		<!-- 飛鳥 -->
		<path
			stroke="#1b4332"
			stroke-width="2"
			stroke-linecap="round"
			fill="none"
			d="M220 58c6-4 12-2 14 2M234 58c6-4 12-2 14 2"
		/>
		<path
			stroke="#1b4332"
			stroke-width="1.8"
			stroke-linecap="round"
			d="M96 72c4-3 8-2 10 2M106 72c4-3 8-2 10 2"
		/>

		<!-- 蝴蝶 -->
		<g transform="translate(176, 96)">
			<g class="whf-butterfly-y">
				<path
					stroke="#40916c"
					stroke-width="1.8"
					stroke-linecap="round"
					d="M12 4v20M12 10C4 4-2 12 2 18s8 4 10-2M12 10c8-6 14 2 10 8s-8 4-10-2"
				/>
				<path stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round" d="M10 22q2 4 4 0" />
			</g>
		</g>
	</svg>
</template>

<style scoped>
.whf-sun {
	transform-origin: 332px 46px;
	transform-box: fill-box;
	animation: whf-sun-breathe 5.6s ease-in-out infinite alternate;
}

.whf-clouds {
	animation: whf-cloud-drift 16s ease-in-out infinite alternate;
}

.whf-butterfly-y {
	animation: whf-butterfly-bob 3.4s ease-in-out infinite alternate;
}

@keyframes whf-sun-breathe {
	from {
		transform: scale(1);
	}
	to {
		transform: scale(1.042);
	}
}

@keyframes whf-cloud-drift {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(8px);
	}
}

@keyframes whf-butterfly-bob {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(-3px);
	}
}

@media (prefers-reduced-motion: reduce) {
	.whf-sun,
	.whf-clouds,
	.whf-butterfly-y {
		animation: none;
	}
}
</style>
