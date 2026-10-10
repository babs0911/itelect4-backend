import "dotenv/config";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth";
import reservationRoutes from "./routes/reservations";

const app = express();
const port = Number(process.env.PORT ?? 3005);

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);

async function start(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not configured");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  await mongoose.connect(mongoUri);
  app.listen(port, () => console.log(`Library reservation API listening on port ${port}`));
}

void start().catch((error: unknown) => {
  console.error("Could not start API", error);
  process.exitCode = 1;
});