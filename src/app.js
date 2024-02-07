import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 16 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


app.use(limiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import playlistRouter from "./routes/playlist.route.js";
import tweetRouter from "./routes/tweet.route.js";
import likeRouter from "./routes/like.route.js";
import commentRouter from "./routes/comment.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js"

// routes declearation
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };
