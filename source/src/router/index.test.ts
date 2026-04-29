import { beforeEach, describe, expect, it, vi } from "vitest";

const createWebHistoryMock = vi.fn();
const beforeEachMock = vi.fn();
const createRouterMock = vi.fn(() => ({
	beforeEach: beforeEachMock,
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
		const config = createRouterMock.mock.calls[0][0];
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
		const guard = beforeEachMock.mock.calls[0][0] as (to: {
			query: { entry?: unknown };
		}) => void;

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
