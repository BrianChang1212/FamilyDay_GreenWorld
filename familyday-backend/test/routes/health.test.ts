import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { healthRouter } from "../../src/routes/health";

function createTestApp(): express.Express {
	const app = express();
	app.use("/api/v1", healthRouter);
	return app;
}

describe("health router", () => {
	it("returns a health response", async () => {
		const res = await request(createTestApp()).get("/api/v1/health");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			ok: true,
			source: "firebase-functions",
		});
	});

	it("returns a readiness response", async () => {
		const res = await request(createTestApp()).get("/api/v1/health/ready");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			ok: true,
			ready: true,
			source: "firebase-functions",
		});
	});
});
