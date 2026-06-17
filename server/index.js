import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import router from "./router/index.js";
import webhookRouter from "./router/webhook-router.js";
import prisma from "./shared/lib/prisma-db.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import logger from "./shared/lib/logger.js";
import { startCronJobs } from "./shared/lib/cron.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 4050;

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── Logging ─────────────────────────────────────────────────────────────────
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Stripe webhook — raw body, must come BEFORE express.json() ──────────────
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
}));
app.use("/api/webhook", webhookRouter);

// ─── Static uploads ───────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ─── JSON body ────────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      database: "connected",
    });
  } catch {
    res.status(503).json({ status: "ERROR", database: "disconnected" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Golobe Server is running! 🚀" });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully via Prisma");

    startCronJobs();

    app.listen(PORT, () => logger.info(`Server started on PORT: ${PORT}`));
  } catch (e) {
    logger.error("Failed to start server", { stack: e.stack });
    process.exit(1);
  }
};

start();
