import { Schema, model } from "mongoose";

import type { UserDoc } from "../types";

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "librarian", "admin"], default: "student" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

export const UserModel = model<UserDoc>("User", userSchema);