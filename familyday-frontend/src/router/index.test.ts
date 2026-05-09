import { beforeEach, describe, expect, it, vi } from "vitest";

type RouterConfig = {
	routes: Array<Record<string, unknown>>;
};

const createWebHistoryMock = vi.fn();
const beforeEachMock = vi.fn();
const afterEachMock = vi.fn();
const createRouterMock = vi.fn((config: RouterConfig) => ({
	beforeEach: beforeEachMock,
	afterEach: afterEachMock,
	__config: config,
}));

const setEntryIntentMock = vi.fn();
const normalizeQueryEntryMock = vi.fn();
const clearCheckinWelcomePassedMock = vi.fn();
const isCheckinWelcomePassedMock = vi.fn(() => true);

vi.mock("vue-router", () => ({
	createRouter: createRouterMock,
	createWebHistory: createWebHistoryMock,
}));

vi.mock("@/lib/entryIntent", () => ({
	setEntryIntent: setEntryIntentMock,
	normalizeQueryEntry: normalizeQueryEntryMock,
	clearCheckinWelcomePassed: clearCheckinWelcomePassedMock,
	isCheckinWelcomePassed: () => isCheckinWelcomePassedMock(),
}));

vi.mock("@/views/home/WelcomeView.vue", () => ({ default: {} }));
vi.mock("@/views/onboarding/BriefingView.vue", () => ({ default: {} }));
vi.mock("@/views/auth/RegisterView.vue", () => ({ default: {} }));
vi.mock("@/views/checkin/CheckInFormView.vue", () => ({ default: {} }));
vi.mock("@/views/checkin/CheckInWelcomeView.vue", () => ({ default: {} }));
vi.mock("@/views/checkin/CheckInCompleteView.vue", () => ({ default: {} }));
vi.mock("@/views/quest/StageView.vue", () => ({ default: {} }));
vi.mock("@/views/quest/QuizView.vue", () => ({ default: {} }));
vi.mock("@/views/quest/ResultView.vue", () => ({ default: {} }));
vi.mock("@/views/quest/FinishView.vue", () => ({ default: {} }));
vi.mock("@/views/quest/ClaimSuccessView.vue", () => ({ default: {} }));

describe("router config and guard", () => {
	function getRouterConfig(): RouterConfig {
		const firstCall = createRouterMock.mock.calls[0];
		if (!firstCall) {
			throw new Error("createRouter was not called");
		}
		return firstCall[0] as RouterConfig;
	}

	function getGuard(): (to: { query: { entry?: unknown } }) => void {
		const firstCall = beforeEachMock.mock.calls[0];
		if (!firstCall) {
			throw new Error("router.beforeEach was not registered");
		}
		return firstCall[0] as (to: { query: { entry?: unknown } }) => void;
	}

	beforeEach(() => {
		vi.resetModules();
		createRouterMock.mockClear();
		createWebHistoryMock.mockClear();
		beforeEachMock.mockClear();
		afterEachMock.mockClear();
		setEntryIntentMock.mockClear();
		normalizeQueryEntryMock.mockReset();
		clearCheckinWelcomePassedMock.mockClear();
		isCheckinWelcomePassedMock.mockImplementation(() => true);
	});

	it("registers check-in and game entry redirects", async () => {
		await import("@/router");
		const config = getRouterConfig();
		const routes = config.routes as Array<Record<string, unknown>>;
		const checkinEntry = routes.find((r) => r.name === "checkinEntry");
		const gameEntry = routes.find((r) => r.name === "gameEntry");

		expect(checkinEntry).toBeTruthy();
		expect(gameEntry).toBeTruthy();

		const checkinRedirect = checkinEntry?.redirect as () => unknown;
		const gameRedirect = gameEntry?.redirect as () => unknown;

		expect(checkinRedirect()).toEqual({ name: "checkinWelcome" });
		expect(setEntryIntentMock).toHaveBeenCalledWith("checkin");
		expect(clearCheckinWelcomePassedMock).toHaveBeenCalledTimes(1);

		expect(gameRedirect()).toEqual({ name: "welcome" });
		expect(setEntryIntentMock).toHaveBeenCalledWith("game");
	});

	it("beforeEach guard sets intent only for normalized values", async () => {
		await import("@/router");
		const guard = getGuard();

		normalizeQueryEntryMock.mockReturnValueOnce("checkin");
		guard({ query: { entry: "checkin" } });
		expect(normalizeQueryEntryMock).toHaveBeenCalledWith("checkin");
		expect(setEntryIntentMock).toHaveBeenCalledWith("checkin");

		setEntryIntentMock.mockClear();
		normalizeQueryEntryMock.mockReturnValueOnce(null);
		guard({ query: { entry: "invalid" } });
		expect(setEntryIntentMock).not.toHaveBeenCalled();
	});

	it("checkin beforeEnter sends users to welcome when welcome not yet passed", async () => {
		isCheckinWelcomePassedMock.mockReturnValue(false);
		await import("@/router");
		const config = getRouterConfig();
		const routes = config.routes as Array<Record<string, unknown>>;
		const checkin = routes.find((r) => r.name === "checkin");
		expect(checkin).toBeTruthy();
		const guard = checkin?.beforeEnter as (
			to: { query: Record<string, string>; hash?: string },
			from: unknown,
			next: (arg?: unknown) => void,
		) => void;
		const next = vi.fn();
		guard({ query: { x: "1" }, hash: "#h" }, {}, next);
		expect(next).toHaveBeenCalledWith({
			name: "checkinWelcome",
			replace: true,
			query: { x: "1" },
			hash: "#h",
		});
	});

	it("checkin beforeEnter allows form when welcome passed", async () => {
		isCheckinWelcomePassedMock.mockReturnValue(true);
		await import("@/router");
		const config = getRouterConfig();
		const routes = config.routes as Array<Record<string, unknown>>;
		const checkin = routes.find((r) => r.name === "checkin");
		const guard = checkin?.beforeEnter as (
			to: unknown,
			from: unknown,
			next: (arg?: unknown) => void,
		) => void;
		const next = vi.fn();
		guard({}, {}, next);
		expect(next).toHaveBeenCalledWith();
	});
});
