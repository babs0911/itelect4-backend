import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header("Authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "A Bearer token is required" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Authentication is not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}