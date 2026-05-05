<script setup lang="ts">
defineProps<{
	size?: "sm" | "md" | "lg";
}>();
</script>

<template>
	<div
		:class="[
			'flex shrink-0 items-center justify-center bg-gw-brand text-white shadow-sm',
			size === 'sm' ? 'h-9 w-9 rounded-lg' : '',
			size === 'md' || size == null ? 'h-11 w-11 rounded-lg' : '',
			size === 'lg' ? 'h-[3.75rem] w-[3.75rem] rounded-2xl shadow-md' : '',
		]"
		aria-hidden="true"
	>
		<svg class="h-[55%] w-[55%]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
			<path
				d="M12 3v3M12 18v3M3 12h3M18 12h3"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
			<path d="M12 8l2 4-2 4-2-4 2-4z" fill="currentColor" opacity="0.9" />
		</svg>
	</div>
</template>
