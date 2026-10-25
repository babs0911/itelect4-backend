import { Schema, model } from "mongoose";

export interface BookDoc {
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  availableCopies: number;
  reservedCount: number;
  summary: string;
  tags: string[];
}

const bookSchema = new Schema<BookDoc>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, sparse: true, unique: true },
    genre: { type: String, required: true, trim: true },
    availableCopies: { type: Number, required: true, min: 0, default: 0 },
    reservedCount: { type: Number, required: true, min: 0, default: 0 },
    summary: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

export const BookModel = model<BookDoc>("Book", bookSchema);
