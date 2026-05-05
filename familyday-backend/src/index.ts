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
	},
	app,
);
