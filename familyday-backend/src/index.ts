import express from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import { getCorsAllowlistResolved, getFunctionsRegion } from "./config/fdgwProject";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import { checkinRouter } from "./routes/checkin";
import { dashboardRouter } from "./routes/dashboard";
import { gameRouter } from "./routes/game";
import { healthRouter } from "./routes/health";
import { staffRouter } from "./routes/staff";

const app = express();
const corsAllowlist = getCorsAllowlistResolved();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || corsAllowlist.has(origin)) {
				callback(null, true);
				return;
			}
			callback(new Error("CORS origin is not allowed"));
		},
		credentials: true,
		allowedHeaders: ["Authorization", "Content-Type", "Accept"],
	}),
);
app.use(express.json());

app.use("/api/v1", healthRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", checkinRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1", gameRouter);
app.use("/api/v1", staffRouter);
app.use("/api/v1", adminRouter);

app.use("/api/v1", (_req, res) => {
	res.status(404).json({
		code: "NOT_FOUND",
		message: "API endpoint not found",
	});
});

export const api = onRequest(
	{
		region: getFunctionsRegion(),
		cors: false,
		invoker: "public",
	},
	app,
);

/*
 * 壓測專用入口：與 `api` 共用同一個 express app 與所有路由，但每次請求進來
 * 前先把 `FDGW_FIRESTORE_DATABASE_ID` 設為 `"loadtest"`，使 `getDb()` 解析到
 * 同專案下的 `loadtest` 具名 Firestore database。獨立 Cloud Run service →
 * 不影響正式 `api` 與 `(default)` db，可長期保留作為壓測／regression 入口。
 */
export const apiLoadtest = onRequest(
	{
		region: getFunctionsRegion(),
		cors: false,
		invoker: "public",
		// 壓測時臨時調高（極限測試 100、常規 60、平時 Gen2 預設 10）
	},
	(req, res) => {
		process.env.FDGW_FIRESTORE_DATABASE_ID = "loadtest";
		return app(req, res);
	},
);
