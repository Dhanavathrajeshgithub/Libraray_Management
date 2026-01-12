import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import errorMiddleware from "./middlewares/error.middleware.js";
export const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// user routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

// book routes
import bookRouter from "./routes/book.routes.js";
app.use("/api/v1/book", bookRouter);

connectDB();

app.use(errorMiddleware);
