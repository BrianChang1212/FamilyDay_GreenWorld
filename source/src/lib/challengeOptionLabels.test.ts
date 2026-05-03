import { describe, expect, it } from "vitest";
import {
	apiOptionsAreAbcdKeys,
	choiceRowsForChallenge,
	questionForChallenge,
} from "@/lib/challengeOptionLabels";

describe("challengeOptionLabels", () => {
	it("detects A–D keys from API", () => {
		expect(apiOptionsAreAbcdKeys(["A", "B", "C", "D"])).toBe(true);
		expect(apiOptionsAreAbcdKeys(["5種", "10種", "30種", "42種"])).toBe(false);
	});

	it("maps c1 to local question and labels", () => {
		expect(questionForChallenge("c1", "API title")).toContain("天鵝湖");
		const rows = choiceRowsForChallenge("c1", ["A", "B", "C", "D"]);
		expect(rows.map((r) => r.key).join("")).toBe("ABCD");
		expect(rows[1].label).toBe("10種");
	});

	it("falls back to API strings when options are not A–D", () => {
		const opts = ["5種", "10種", "30種", "42種"];
		const rows = choiceRowsForChallenge("c1", opts);
		expect(rows).toEqual(
			opts.map((k) => ({ key: k, label: k })),
		);
	});

	it("uses A–D when API omits options (minimal challenge payload)", () => {
		const rows = choiceRowsForChallenge("c1", []);
		expect(rows.map((r) => r.key).join("")).toBe("ABCD");
		expect(rows[1].label).toBe("10種");
	});
});
