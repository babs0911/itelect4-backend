import { Router } from "express";
import { isValidObjectId, Types } from "mongoose";

import { auth } from "../middleware/auth";
import { ReservationModel } from "../models/reservation";
import { ReservationStatus, type ReservationUpdateBody } from "../types";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const reservations = await ReservationModel.find({ userId: req.userId }).sort({ requestedAt: -1 });
  res.json(reservations);
});

router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  const reservation = await ReservationModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  res.json(reservation);
});

router.post("/", async (req, res) => {
  const { bookId, status, reservedUntil, renewalCount } = req.body as Record<string, unknown>;
  if (typeof bookId !== "string" || !isValidObjectId(bookId)) {
    res.status(400).json({ message: "A valid bookId is required" });
    return;
  }
  const allowedStatus = Object.values(ReservationStatus).filter((value) => typeof value === "number");
  if (status !== undefined && (typeof status !== "number" || !allowedStatus.includes(status))) {
    res.status(400).json({ message: "Invalid reservation status" });
    return;
  }
  if (renewalCount !== undefined && typeof renewalCount !== "number") {
    res.status(400).json({ message: "renewalCount must be a number" });
    return;
  }
  if (reservedUntil !== undefined && (typeof reservedUntil !== "string" || Number.isNaN(Date.parse(reservedUntil)))) {
    res.status(400).json({ message: "reservedUntil must be a valid date" });
    return;
  }
  const reservation = await ReservationModel.create({
    bookId: new Types.ObjectId(bookId),
    userId: new Types.ObjectId(req.userId!),
    ...(status === undefined ? {} : { status: status as ReservationStatus }),
    ...(reservedUntil === undefined ? {} : { reservedUntil: new Date(reservedUntil as string) }),
    ...(renewalCount === undefined ? {} : { renewalCount }),
  });
  res.status(201).json(reservation);
});

router.put("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  const update = req.body as ReservationUpdateBody;
  const allowedStatus = Object.values(ReservationStatus).filter((value) => typeof value === "number");
  if (update.status !== undefined && !allowedStatus.includes(update.status)) {
    res.status(400).json({ message: "Invalid reservation status" });
    return;
  }

  const reservation = await ReservationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    {
      ...(update.status === undefined ? {} : { status: update.status }),
      ...(update.reservedUntil === undefined ? {} : { reservedUntil: update.reservedUntil }),
      ...(update.borrowedAt === undefined ? {} : { borrowedAt: update.borrowedAt }),
      ...(update.returnedAt === undefined ? {} : { returnedAt: update.returnedAt }),
      ...(update.renewalCount === undefined ? {} : { renewalCount: update.renewalCount }),
    },
    { new: true, runValidators: true },
  );
  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  res.json(reservation);
});

router.delete("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  const reservation = await ReservationModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }
  res.status(204).end();
});

export default router;