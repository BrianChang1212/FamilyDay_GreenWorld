import { beforeEach, describe, expect, it, vi } from "vitest";

type RouterConfig = {
	routes: Array<Record<string, unknown>>;
};

const createWebHistoryMock = vi.fn();
const beforeEachMock = vi.fn();
const createRouterMock = vi.fn((config: RouterConfig) => ({
	beforeEach: beforeEachMock,
	__config: config,
}));

const setEntryIntentMock = vi.fn();
const normalizeQueryEntryMock = vi.fn();

vi.mock("vue-router", () => ({
	createRouter: createRouterMock,
	createWebHistory: createWebHistoryMock,
}));

vi.mock("@/lib/entryIntent", () => ({
	setEntryIntent: setEntryIntentMock,
	normalizeQueryEntry: normalizeQueryEntryMock,
}));

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
		setEntryIntentMock.mockClear();
		normalizeQueryEntryMock.mockReset();
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

		expect(checkinRedirect()).toEqual({ name: "checkin" });
		expect(setEntryIntentMock).toHaveBeenCalledWith("checkin");

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
});
