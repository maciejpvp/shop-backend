import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";

import { AppError } from "./utils/appError.js";

import userRouter from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

import { ErrorHandler } from "./controllers/errorController.js";
import imageHandler from "./middlewares/imageHandler.js";

const app = express();
app.use(cors());
app.use((req, res, next) => {
  console.log(req.query);
  next();
});
app.use(cookieParser());
app.use(helmet());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());
app.use(xss());
// app.use(hpp());
app.use(
  hpp({
    whitelist: ["category"],
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/items", itemRoutes);
app.get("/images/:id", imageHandler);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this API`, 404));
});

app.use(ErrorHandler);

export default app;
