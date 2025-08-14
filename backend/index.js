import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://payment-wallet-714e.vercel.app",
      // Add your frontend URL when deployed
    ],
    credentials: true,
  })
);

// Basic health check
app.get("/", (req, res) => {
  res.send("Paytm backend is up");
});

// DB-aware health endpoint
app.get("/healthz", async (req, res) => {
  try {
    // Ensure DB connection for serverless
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const state = mongoose.connection.readyState;
    const stateText =
      {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      }[state] || "unknown";

    const isHealthy = state === 1;
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "ok" : "degraded",
      db: stateText,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Connect to DB for serverless (each request needs connection)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to database...");
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Mount routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", accountRoutes);

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(
        "Failed to connect to MongoDB. Server not started.",
        err?.message || err
      );
      process.exit(1);
    });
}

// Export for Vercel
export default app;
