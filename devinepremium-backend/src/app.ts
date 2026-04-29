import cors from "cors";
import express from "express";
import accountRoutes from "./routes/accountRoutes";
import { env } from "./config/env";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes";
import { HttpError } from "./utils/http";

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

  app.use(
    "/api/v1/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookRoutes,
  );

  app.use(express.json({ limit: "80mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      databaseDriver: env.DATABASE_DRIVER,
    });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/account", accountRoutes);
  app.use("/api/v1/services", serviceRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
  app.use("/api/v1/payments", paymentRoutes);
  app.use("/api/v1/admin", adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found." });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    const statusCode =
      error instanceof HttpError
        ? error.statusCode
        : typeof error === "object" &&
            error !== null &&
            "statusCode" in error &&
            typeof (error as { statusCode?: unknown }).statusCode === "number"
          ? Number((error as { statusCode: number }).statusCode)
          : 500;

    res.status(statusCode).json({
      message,
    });
  });

  return app;
}
