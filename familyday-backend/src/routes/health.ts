import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
	res.status(200).json({ ok: true, source: "firebase-functions" });
});

healthRouter.get("/health/ready", (_req, res) => {
	res.status(200).json({ ok: true, ready: true, source: "firebase-functions" });
});
