import { describe, expect, it } from "vitest";
import { runTeardown, withoutPublicInvoker } from "../../src/scheduled/teardownActions";

describe("withoutPublicInvoker", () => {
	it("removes allUsers from run.invoker but keeps other members", () => {
		const out = withoutPublicInvoker({
			bindings: [
				{ role: "roles/run.invoker", members: ["allUsers", "user:a@x.com"] },
			],
			etag: "e1",
		});
		expect(out.bindings).toEqual([
			{ role: "roles/run.invoker", members: ["user:a@x.com"] },
		]);
		expect(out.etag).toBe("e1"); // etag 保留（setIamPolicy 需要）
	});

	it("drops the run.invoker binding entirely when allUsers was its only member", () => {
		const out = withoutPublicInvoker({
			bindings: [
				{ role: "roles/run.invoker", members: ["allUsers"] },
				{ role: "roles/run.developer", members: ["user:b@x.com"] },
			],
		});
		// run.invoker 變空 → 丟棄；其他綁定原樣保留
		expect(out.bindings).toEqual([
			{ role: "roles/run.developer", members: ["user:b@x.com"] },
		]);
	});

	it("does not touch non-invoker bindings even if they contain allUsers", () => {
		const out = withoutPublicInvoker({
			bindings: [{ role: "roles/run.viewer", members: ["allUsers"] }],
		});
		expect(out.bindings).toEqual([
			{ role: "roles/run.viewer", members: ["allUsers"] },
		]);
	});

	it("is a no-op when allUsers is absent", () => {
		const policy = { bindings: [{ role: "roles/run.invoker", members: ["user:a@x.com"] }] };
		expect(withoutPublicInvoker(policy).bindings).toEqual(policy.bindings);
	});

	it("handles empty / missing bindings", () => {
		expect(withoutPublicInvoker({}).bindings).toEqual([]);
		expect(withoutPublicInvoker({ bindings: [] }).bindings).toEqual([]);
	});
});

describe("runTeardown dry-run plan", () => {
	it("lists the 4 teardown actions on the right targets without mutating", async () => {
		const results = await runTeardown(true); // dryRun → 不呼叫任何 API
		expect(results.map((r) => r.action)).toEqual([
			"hosting:disable",
			"run:remove-invoker:api",
			"run:remove-invoker:apiloadtest",
			"scheduler:pause-dump",
		]);
		expect(results.every((r) => r.ok)).toBe(true);
		expect(results.every((r) => r.detail.startsWith("DRY-RUN"))).toBe(true);
		// 目標正確：hosting site / dump scheduler job
		expect(results[0].detail).toContain("sites/familyday-greenworld/releases?type=SITE_DISABLE");
		expect(results[3].detail).toContain("firebase-schedule-dumpCheckinsDaily-us-central1:pause");
	});
});
