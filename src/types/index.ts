import type { Types } from "mongoose";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "librarian" | "admin";
  isActive: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  availableCopies: number;
  reservedCount: number;
  summary: string;
  tags: string[];
}

export interface Reservation {
  id: number;
  bookId: number;
  userId: number;
  status: ReservationStatus;
  requestedAt: Date;
  reservedUntil?: Date;
  borrowedAt?: Date;
  returnedAt?: Date;
  renewalCount?: number;
}

export enum ReservationStatus {
  Pending,
  Reserved,
  Borrowed,
  Returned,
}

export type UserDoc = Omit<User, "id"> & { passwordHash: string };
export type ReservationDoc = Omit<Reservation, "id" | "bookId" | "userId"> & {
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
};
export type NewReservationBody = Pick<Reservation, "bookId"> &
  Partial<Pick<Reservation, "status" | "reservedUntil" | "renewalCount">>;
export type ReservationUpdateBody = Partial<
  Pick<Reservation, "status" | "reservedUntil" | "borrowedAt" | "returnedAt" | "renewalCount">
>;