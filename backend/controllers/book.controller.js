import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Book } from "../models/book.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const bookAdd = asyncHandler(async (req, res) => {
  // Trust auth middleware - req.user is already verified
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Only Admins can add books");
  }

  const bookData = {
    title: req.body.title?.trim(),
    author: req.body.author?.trim(),
    description: req.body.description,
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
  };

  const newBook = await Book.create(bookData); // Schema validates automatically

  res
    .status(201)
    .json(new ApiResponse(201, newBook, "Book added successfully"));
});

export const deleteBook = asyncHandler(async (req, res) => {
  // Trust auth middleware - req.user is already verified
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Only Admins can delete books");
  }
  const book = await Book.findByIdAndDelete(req.body.id);
});
