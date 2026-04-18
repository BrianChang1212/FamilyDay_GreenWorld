import { defineComponent, onMounted } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRewardClaimPresentation } from "@/composables/useRewardClaimPresentation";
import * as apiBase from "@/lib/apiBase";
import * as rewardApi from "@/api/rewardClaimStatus";

vi.mock("@/lib/apiBase");
vi.mock("@/api/rewardClaimStatus");

const Harness = defineComponent({
	setup() {
		const pres = useRewardClaimPresentation();
		onMounted(() => {
			void pres.loadClaimPresentation();
		});
		return pres;
	},
	template: "<div />",
});

async function mountWithRoute(query: Record<string, string>) {
	const router = createRouter({
		history: createMemoryHistory(),
		routes: [{ path: "/", name: "root", component: Harness }],
	});
	await router.push({ path: "/", query });
	await router.isReady();
	const wrapper = mount(Harness, {
		global: { plugins: [router] },
	});
	await flushPromises();
	return { wrapper, router };
}

describe("useRewardClaimPresentation", () => {
	beforeEach(() => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockReset();
	});

	it("loads mock_claimed from route on mount", async () => {
		const { wrapper } = await mountWithRoute({ mock_claimed: "2" });
		expect(wrapper.vm.statusLoadState).toBe("ok");
		expect(wrapper.vm.claimed).toBe(2);
		expect(wrapper.vm.statusSource).toBe("mock-query");
		expect(wrapper.vm.isMockPreview).toBe(true);
	});

	it("uses local fallback when no API base", async () => {
		sessionStorage.setItem("fdgw_finishClaimed", "1");
		const { wrapper } = await mountWithRoute({});
		expect(wrapper.vm.statusLoadState).toBe("ok");
		expect(wrapper.vm.claimed).toBe(1);
		expect(wrapper.vm.statusSource).toBe("local-fallback");
	});

	it("loads from API when base is configured", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.test");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockResolvedValue({
			claimedCount: 2,
			maxSlots: 3,
		});
		const { wrapper } = await mountWithRoute({});
		expect(wrapper.vm.statusLoadState).toBe("ok");
		expect(wrapper.vm.claimed).toBe(2);
		expect(wrapper.vm.statusSource).toBe("api");
		expect(rewardApi.fetchRewardClaimStatus).toHaveBeenCalledOnce();
	});

	it("sets error state when API fails", async () => {
		vi.mocked(apiBase.getViteApiBase).mockReturnValue("https://api.test");
		vi.mocked(rewardApi.fetchRewardClaimStatus).mockRejectedValue(
			new Error("boom"),
		);
		const { wrapper } = await mountWithRoute({});
		expect(wrapper.vm.statusLoadState).toBe("error");
		expect(wrapper.vm.statusError).toBe("boom");
	});

	it("reloads when mock_claimed query changes", async () => {
		const { wrapper, router } = await mountWithRoute({});
		expect(wrapper.vm.statusSource).toBe("local-fallback");
		await router.replace({ path: "/", query: { mock_claimed: "3" } });
		await flushPromises();
		expect(wrapper.vm.claimed).toBe(3);
		expect(wrapper.vm.statusSource).toBe("mock-query");
	});
});
