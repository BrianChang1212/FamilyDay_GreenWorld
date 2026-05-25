<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
	<div class="relative box-border flex min-h-dvh flex-col bg-gw-page">
		<RouterView v-slot="{ Component }">
			<component
				:is="Component"
				:key="route.fullPath"
				class="flex min-h-dvh min-w-0 w-full flex-1 flex-col"
			/>
		</RouterView>
	</div>
</template>
