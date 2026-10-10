import { Schema, model } from "mongoose";

import { ReservationStatus, type ReservationDoc } from "../types";

const reservationSchema = new Schema<ReservationDoc>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: [true, "bookId is required"] },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: Number,
      enum: Object.values(ReservationStatus).filter((value) => typeof value === "number"),
      default: ReservationStatus.Pending,
    },
    requestedAt: { type: Date, required: true, default: Date.now },
    reservedUntil: { type: Date },
    borrowedAt: { type: Date },
    returnedAt: { type: Date },
    renewalCount: { type: Number, min: [0, "renewalCount cannot be negative"], max: [3, "renewalCount cannot exceed 3"], default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

export const ReservationModel = model<ReservationDoc>("Reservation", reservationSchema);
