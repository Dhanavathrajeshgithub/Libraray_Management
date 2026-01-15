import { Book } from "../models/book.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Borrow } from "../models/borrow.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const borrowBookByUser = asyncHandler(async (req, res) => {
  const { bookId, userId } = req.params;
  if (!bookId || !userId) {
    throw new ApiError(400, "Both UserId and bookId are required");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError(404, "book not found");
  }
  if (!book.availability) {
    throw new ApiError(409, "Book is Out of Stock. Sorry, check other books");
  }
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId === bookId && b.returned === false
  );
  if (isAlreadyBorrowed) {
    throw new ApiError(400, "User already borrowed this book");
  }
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save({ validateModifiedOnly: true });
  user.borrowedBooks.push({
    bookId,
    borrowedDate: Date.now(),
    dueDate: Date.now() + process.env.DUEDAYS * 24 * 60 * 60 * 1000,
  });
  await user.save({ validateModifiedOnly: true });
  await Borrow.create({
    userId,
    price: book.price,
    bookId,
    borrowDate: Date.now(),
    dueDate: Date.now() + process.env.DUEDAYS * 24 * 60 * 60 * 1000,
    fine: process.env.FINE_PER_DAY,
  });
  if (!borrowedObj) {
    throw new ApiError(500, "Failed to create borrowed object");
  }
  res
    .status(201)
    .json(new ApiResponse(201, {}, "Successfully created borrowed object"));
});
export const returnBookByUser = asyncHandler(async (req, res) => {});
export const getBorrowedBooksByUser = asyncHandler(async (req, res) => {});
export const getAllBorrowedBooksByUsers = asyncHandler(async (req, res) => {});
