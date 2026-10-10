import { compare, hash } from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/user";

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required" });
    return;
  }

  try {
    const user = await UserModel.create({ name, email, passwordHash: await hash(password, 12) });
    const token = jwt.sign({}, getJwtSecret(), { subject: user.id, expiresIn: "1d" });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }
    res.status(400).json({ message: "Could not register account" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim(), isActive: true }).select("+passwordHash");
    if (!user || !(await compare(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign({}, getJwtSecret(), { subject: user.id, expiresIn: "1d" });
    res.json({ token, user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not log in" });
  }
});

export default router;

function publicUser(user: { id: string; name: string; email: string; role: string; isActive: boolean }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
}