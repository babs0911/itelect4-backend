import { Types } from "mongoose";

import { ReservationModel } from "../models/reservation.js";
import { type ReservationStatus } from "../types/index.js";

interface CreateReservationInput {
  bookId: string;
  userId: string;
  status?: ReservationStatus;
  reservedUntil?: Date;
  renewalCount?: number;
}

export const reservationRepository = {
  create(input: CreateReservationInput) {
    return ReservationModel.create({
      bookId: new Types.ObjectId(input.bookId),
      userId: new Types.ObjectId(input.userId),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.reservedUntil === undefined ? {} : { reservedUntil: input.reservedUntil }),
      ...(input.renewalCount === undefined ? {} : { renewalCount: input.renewalCount }),
    });
  },
};