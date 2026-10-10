import "dotenv/config";

import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { setServers } from "node:dns";
import mongoose from "mongoose";

import { applicationsRouter } from "./routes/applications.js";
import { authRouter } from "./routes/auth.js";
import reservationRoutes from "./routes/reservations.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/reservations", reservationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Invalid resource identifier" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }

  console.error("Request failed", error);
  res.status(500).json({ message: "An unexpected server error occurred" });
};

app.use(handleError);

const port = Number(process.env.PORT ?? 4000);

async function start(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not configured");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    if (
      mongoUri.startsWith("mongodb+srv://") &&
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ECONNREFUSED" &&
      "syscall" in error &&
      error.syscall === "querySrv"
    ) {
      console.warn("System DNS refused the MongoDB SRV lookup; retrying with Cloudflare DNS");
      setServers(["1.1.1.1", "1.0.0.1"]);
      await mongoose.connect(mongoUri);
    } else {
      throw error;
    }
  }

  app.listen(port, () => {
    console.log(`Library reservation API listening on port ${port}`);
  });
}

void start().catch((error: unknown) => {
  console.error("Could not start API", error);
  process.exitCode = 1;
});