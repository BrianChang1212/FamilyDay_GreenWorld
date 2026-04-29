"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("./routes/auth");
const admin_1 = require("./routes/admin");
const checkin_1 = require("./routes/checkin");
const dashboard_1 = require("./routes/dashboard");
const game_1 = require("./routes/game");
const health_1 = require("./routes/health");
const staff_1 = require("./routes/staff");
const app = (0, express_1.default)();
const corsAllowlist = new Set([
    "http://localhost:5173",
    "http://localhost:4173",
    "https://familyday-greenworld.netlify.app",
    "https://brianchang1212.github.io",
]);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || corsAllowlist.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS origin is not allowed"));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/v1", health_1.healthRouter);
app.use("/api/v1", auth_1.authRouter);
app.use("/api/v1", checkin_1.checkinRouter);
app.use("/api/v1", dashboard_1.dashboardRouter);
app.use("/api/v1", game_1.gameRouter);
app.use("/api/v1", staff_1.staffRouter);
app.use("/api/v1", admin_1.adminRouter);
app.use("/api/v1", (_req, res) => {
    res.status(404).json({
        code: "NOT_FOUND",
        message: "API endpoint not found",
    });
});
exports.api = (0, https_1.onRequest)({
    region: "us-central1",
    cors: false,
}, app);
