import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../src/middleware/database.js", () => ({
  connectDatabase: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock("../src/models/reservation.js", () => ({
  ReservationModel: {
    find: vi.fn(() => ({
      sort: vi.fn().mockResolvedValue([]),
    })),
  },
}));

import { app } from "../src/index.js";

const testSecret = process.env.JWT_SECRET!;
const previousSecret = process.env.JWT_SECRET;

describe("GET /api/reservations", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
  });

  afterAll(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  });

  it("returns 401 when no token is provided", async () => {
    const response = await request(app).get("/api/reservations");

    expect(response.status).toBe(401);
  });

  it("allows a valid token past authentication", async () => {
    const token = jwt.sign({ sub: "507f1f77bcf86cd799439011" }, testSecret);
    const response = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
