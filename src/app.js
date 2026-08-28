import "dotenv/config";
import express from "express";
import userRouter from "./features/users/user.route.js";
import authRouter from "./features/auth/auth.route.js"
import { errorHandler } from "./midlleware/error.middleware.js";

const app = express();

const port = process.env.PORT || 3000

app.use(express.json());

app.use("/v1/users", userRouter);

app.use("/v1/auth", authRouter);

app.use(errorHandler);

app.listen(port, () => {
    console.log("server đang chạy...");
});