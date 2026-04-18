import { beforeEach, describe, expect, it } from "vitest";
import {
	clearEntryIntent,
	getEntryIntent,
	normalizeQueryEntry,
	setEntryIntent,
} from "@/lib/entryIntent";

describe("entryIntent", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	describe("normalizeQueryEntry", () => {
		it("accepts checkin and game", () => {
			expect(normalizeQueryEntry("checkin")).toBe("checkin");
			expect(normalizeQueryEntry("game")).toBe("game");
		});

		it("returns null for other values", () => {
			expect(normalizeQueryEntry(undefined)).toBeNull();
			expect(normalizeQueryEntry("")).toBeNull();
			expect(normalizeQueryEntry("CHECKIN")).toBeNull();
			expect(normalizeQueryEntry(1)).toBeNull();
		});
	});

	it("setEntryIntent / getEntryIntent / clearEntryIntent round-trip", () => {
		expect(getEntryIntent()).toBeNull();
		setEntryIntent("checkin");
		expect(getEntryIntent()).toBe("checkin");
		clearEntryIntent();
		expect(getEntryIntent()).toBeNull();
		setEntryIntent("game");
		expect(getEntryIntent()).toBe("game");
	});

	it("getEntryIntent ignores corrupted storage values", () => {
		sessionStorage.setItem("fdgw_entry_intent", "other");
		expect(getEntryIntent()).toBeNull();
	});
});
