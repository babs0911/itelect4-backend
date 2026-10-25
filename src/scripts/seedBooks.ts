import "dotenv/config";

import { setServers } from "node:dns";
import mongoose from "mongoose";

import { BookModel } from "../models/book.js";

const books = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Programming",
    availableCopies: 2,
    reservedCount: 1,
    summary: "A practical guide to writing readable software.",
    tags: ["programming", "best-practices"],
  },
  {
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    genre: "Programming",
    availableCopies: 1,
    reservedCount: 0,
    summary: "A deep dive into JavaScript fundamentals.",
    tags: ["javascript", "advanced"],
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    genre: "Software Engineering",
    availableCopies: 3,
    reservedCount: 2,
    summary: "Practical advice for modern software development teams.",
    tags: ["software", "career"],
  },
];

async function seedBooks(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not configured");

  try {
    await mongoose.connect(mongoUri);
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
      await mongoose.connect(mongoUri);
    } else {
      throw error;
    }
  }
  try {
    await BookModel.bulkWrite(
      books.map((book) => ({
        updateOne: {
          filter: { title: book.title },
          update: { $set: book },
          upsert: true,
        },
      })),
    );
    console.log(`Seeded ${books.length} books`);
  } finally {
    await mongoose.disconnect();
  }
}

void seedBooks().catch((error: unknown) => {
  console.error("Could not seed books", error);
  process.exitCode = 1;
});
