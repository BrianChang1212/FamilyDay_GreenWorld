<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import PageCritters from "@/components/doodles/PageCritters.vue";
import { setInZone, setProfile } from "@/lib/demoState";

const router = useRouter();
const name = ref("");
const employeeId = ref("");

const inputClass =
	"w-full rounded-2xl border border-white/90 bg-white/92 px-4 py-3.5 text-base text-gw-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_20px_rgba(26,157,74,0.06)] outline-none ring-1 ring-gw-mint-soft/40 transition-[border-color,box-shadow,ring-color] placeholder:text-neutral-400 focus:border-gw-brand/80 focus:ring-4 focus:ring-gw-brand/[0.14]";

function submit() {
	if (!name.value.trim() || !employeeId.value.trim()) return;
	setProfile(name.value, employeeId.value);
	setInZone(false);
	router.push({ name: "stage" });
}
</script>

<template>
	<div
		class="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-b from-gw-mint/55 via-white to-[#ecfdf5]/95"
	>
		<!-- 環境光暈 -->
		<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
			<div
				class="gw-login-blob -left-[28%] -top-[18%] h-[22rem] w-[22rem] bg-gw-brand/30"
				style="animation-delay: -4s"
			/>
			<div
				class="gw-login-blob -right-[24%] top-[12%] h-[26rem] w-[26rem] bg-sky-200/50"
				style="animation-delay: -9s"
			/>
			<div
				class="gw-login-blob bottom-[-20%] left-[18%] h-[20rem] w-[20rem] bg-amber-100/45"
				style="animation-delay: -2s"
			/>
			<div
				class="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(26,157,74,0.12),transparent_55%)]"
			/>
		</div>

		<div class="pointer-events-none absolute inset-0 z-[1] opacity-[0.95]" aria-hidden="true">
			<PageCritters variant="inline" />
		</div>

		<div
			class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[3px] bg-gradient-to-r from-transparent via-gw-brand/70 to-transparent shadow-[0_2px_16px_rgba(26,157,74,0.35)]"
			aria-hidden="true"
		/>

		<AppHeader class="relative z-[3]" :show-progress="false" :show-user="false" />

		<main class="relative z-[3] flex flex-1 flex-col px-4 pb-6 pt-2 sm:px-7">
			<div
				class="gw-login-panel gw-cover-in mx-auto mt-2 flex w-full max-w-[420px] flex-1 flex-col rounded-[1.85rem] border border-white/80 bg-white/72 p-6 shadow-[0_24px_64px_-18px_rgba(26,157,74,0.22),0_12px_40px_rgba(15,31,46,0.1)] backdrop-blur-xl sm:p-8 sm:pb-10"
				style="--gw-d: 40ms"
			>
				<header class="text-center">
					<div class="relative mx-auto flex h-[4.25rem] w-[4.25rem] items-center justify-center">
						<div
							class="absolute inset-[-10px] rounded-[1.35rem] bg-gradient-to-br from-gw-brand/25 via-white/40 to-amber-100/30 opacity-90 blur-md"
							aria-hidden="true"
						/>
						<div
							class="gw-login-logo-orbit absolute inset-[-14px] rounded-[1.5rem] border border-dashed border-gw-brand/25"
							aria-hidden="true"
						/>
						<BrandLogo size="lg" class="relative z-10 drop-shadow-sm" />
					</div>

					<p
						class="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-gw-brand/70"
					>
						Family Day · Green World
					</p>
					<h1
						class="gw-login-title font-display mt-3 text-[1.65rem] font-bold tracking-tight sm:text-[1.85rem]"
					>
						登入活動
					</h1>
					<div class="mx-auto mt-4 flex max-w-[16rem] items-center justify-center gap-2.5">
						<span
							class="h-px flex-1 max-w-[3.5rem] bg-gradient-to-r from-transparent to-gw-brand/35"
						/>
						<span class="text-xs text-amber-500/90" aria-hidden="true">✦</span>
						<span
							class="h-px flex-1 max-w-[3.5rem] bg-gradient-to-l from-transparent to-gw-brand/35"
						/>
					</div>
					<p class="mx-auto mt-4 max-w-[20rem] text-sm leading-relaxed text-neutral-600">
						請填寫與簽到一致之資料，以開通當日闖關與獎項核對權限。
					</p>
				</header>

				<form class="mt-9 flex flex-1 flex-col gap-6" @submit.prevent="submit" novalidate>
					<div class="gw-cover-in space-y-2" style="--gw-d: 140ms">
						<label
							for="reg-name"
							class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gw-brand-dark/70"
						>
							姓名
						</label>
						<input
							id="reg-name"
							v-model="name"
							type="text"
							name="name"
							autocomplete="name"
							placeholder="請輸入姓名"
							:class="inputClass"
						/>
					</div>

					<div class="gw-cover-in space-y-2" style="--gw-d: 200ms">
						<label
							for="reg-employee-id"
							class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gw-brand-dark/70"
						>
							員工編號
						</label>
						<input
							id="reg-employee-id"
							v-model="employeeId"
							type="text"
							name="username"
							autocomplete="username"
							placeholder="例如 1141041"
							:class="inputClass"
						/>
					</div>

					<div
						class="gw-cover-in relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-white to-gw-mint/25 px-4 py-3.5 text-sm leading-relaxed text-amber-950/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-amber-100/60"
						style="--gw-d: 260ms"
						role="status"
					>
						<div
							class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/25 blur-2xl"
							aria-hidden="true"
						/>
						<div class="relative flex gap-3">
							<span
								class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-amber-50 text-gw-brand shadow-sm ring-1 ring-amber-200/50"
								aria-hidden="true"
							>
								<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
									<path
										d="M12 10v5M12 7h.01"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
									/>
								</svg>
							</span>
							<p class="pt-0.5">
								請確認資訊正確；錯誤可能影響<strong class="font-semibold text-gw-navy"
									>獲獎資格</strong>與站點紀錄。
							</p>
						</div>
					</div>

					<div class="gw-cover-in mt-auto pt-2" style="--gw-d: 320ms">
						<button
							type="submit"
							:disabled="!name.trim() || !employeeId.trim()"
							class="gw-login-submit group relative flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition duration-200 ease-out hover:brightness-[1.06] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-gw-brand disabled:cursor-not-allowed disabled:opacity-[0.4] disabled:shadow-none disabled:hover:brightness-100"
						>
							<span class="relative z-10">進入探索</span>
							<svg
								class="relative z-10 h-5 w-5 transition-transform enabled:group-hover:translate-x-0.5"
								viewBox="0 0 24 24"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M5 12h12M13 6l6 6-6 6"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>
				</form>
			</div>
		</main>

		<AppFooter class="relative z-[3]" />
	</div>
</template>
