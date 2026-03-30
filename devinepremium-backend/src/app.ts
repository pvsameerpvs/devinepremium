import cors from "cors";
import express from "express";
import accountRoutes from "./routes/accountRoutes";
import { env } from "./config/env";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS."));
      },
    }),
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      databaseDriver: env.DATABASE_DRIVER,
    });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/account", accountRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
  app.use("/api/v1/payments", paymentRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    res.status(500).json({
      message,
    });
  });

  return app;
}
