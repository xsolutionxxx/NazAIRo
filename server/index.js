import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router/index.js";
import prisma from "./shared/lib/prisma-db.js";
import errorMiddleware from "./middlewares/error-middleware.js";

const PORT = process.env.PORT || 4050;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
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
    console.log(e);
    process.exit(1);
  }
};

start();
