import type { NextFunction, Request, Response } from "express";
import { setServers } from "node:dns";
import mongoose from "mongoose";

let connectionAttempt: Promise<typeof mongoose> | undefined;

async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionAttempt) return connectionAttempt;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not configured");

  const attempt = (async () => {
    try {
      return await mongoose.connect(mongoUri);
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
        return mongoose.connect(mongoUri);
      }
      throw error;
    }
  })();

  connectionAttempt = attempt;
  try {
    return await attempt;
  } finally {
    if (connectionAttempt === attempt) connectionAttempt = undefined;
  }
}

export async function connectDatabase(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
}
