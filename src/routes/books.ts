import { Router } from "express";
import { isValidObjectId } from "mongoose";

import { BookModel } from "../models/book.js";

export const booksRouter = Router();

booksRouter.get("/", async (_req, res) => {
  const books = await BookModel.find().sort({ title: 1 });
  res.json(books);
});

booksRouter.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const book = await BookModel.findById(req.params.id);
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  res.json(book);
});

export default booksRouter;
