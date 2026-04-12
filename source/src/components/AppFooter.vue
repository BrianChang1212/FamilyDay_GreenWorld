<script setup lang="ts">
const links = [
	{ label: "SAFETY", href: "#" },
	{ label: "PRIVACY", href: "#" },
	{ label: "CONTACT", href: "#" },
] as const;
</script>

<template>
	<footer
		class="mt-auto shrink-0 border-t border-neutral-200/70 bg-white/90 px-4 py-3.5 text-[10px] text-neutral-400 backdrop-blur-md"
	>
		<div class="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
			<div class="flex min-w-0 items-center gap-2">
				<span
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gw-mint/50 text-xs ring-1 ring-gw-mint-soft/60"
					aria-hidden="true"
					>🧭</span
				>
				<span class="leading-snug tracking-wide text-neutral-500"
					>POWERED BY AmTRAN Technology Co., Ltd.</span
				>
			</div>
			<nav
				class="flex flex-wrap justify-end gap-x-4 font-bold tracking-[0.14em] text-neutral-500"
				aria-label="Footer links"
			>
				<a
					v-for="l in links"
					:key="l.label"
					:href="l.href"
					class="transition hover:text-gw-brand"
					@click.prevent
					>{{ l.label }}</a
				>
			</nav>
		</div>
	</footer>
</template>
