import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import manageUserRouter from "./app/routes/admin/manageUser.route";
import path from "path";
import authRouter from "./app/routes/auth.route";
import driverRouter from "./app/routes/admin/manageDriver.route";
import adminAuthRouter from "./app/routes/admin/adminauth.route";
import driverAuthRoute from "./app/routes/driverAuth.route";
import rideRouter from "./app/routes/ride.route";
import bannerRouter from "./app/routes/banner.route";
import couponRouter from "./app/routes/coupon.route";
import supportRouter from "./app/routes/support.route";
export const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/admin/manageUser", manageUserRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/manageDriver", driverRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/auth", authRouter);
app.use("/api/driver/auth", driverAuthRoute);
app.use("/api/ride/", rideRouter);
app.use("/api/mobile/banner", bannerRouter);
app.use("/api/support", supportRouter);
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: "Server is running",
      data: {
        status: "barely-alive",
        uptime: "99.9% (if you round up aggressively)",
        services: {
          database: {
            status: "crying softly",
            latency_ms: 420,
          },
          payment_gateway: {
            status: "vibing",
            latency_ms: 69,
          },
        },
        server_temperature: "Too hot to touch 🔥",
        mood: "🫠",
        fun_fact: "Once routed a ride through a cow field. Rider gave 5 stars.",
      },
    });
  } catch (error: unknown) {
    next(error);
  }
});

app.use(globalErrorHandler);
