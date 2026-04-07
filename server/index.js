import "dotenv/config";
import express from "express";
import cors from "cors";
/* import helmet from "helmet";
import rateLimit from "express-rate-limit"; */
import cookieParser from "cookie-parser";
import router from "./router/index.js";
import prisma from "./shared/lib/prisma-db.js";
import errorMiddleware from "./middlewares/error-middleware.js";

const PORT = process.env.PORT || 4050;

/* const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter); */

const app = express();
/* app.use(helmet()); */
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);
app.use("/api", router);
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "NazAIRo Server is running! 🚀" });
});

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully via Prisma");

    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
};

start();
