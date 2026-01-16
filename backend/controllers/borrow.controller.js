import { Book } from "../models/book.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Borrow } from "../models/borrow.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculateFine } from "../utils/calculateFine.js";

export const borrowBookByUser = asyncHandler(async (req, res) => {
  const { bookId, userId } = req.params;
  if (!bookId || !userId) {
    throw new ApiError(400, "Both UserId and bookId are required");
  }
  const user = await User.findOne({ _id: userId, accountVerified: true });
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
  const isAlreadyBorrowed = await user.isBookBorrowed(bookId);
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
  const borrowedObj = await Borrow.create({
    userId,
    price: book.price,
    bookId,
    borrowDate: Date.now(),
    dueDate: Date.now() + process.env.DUEDAYS * 24 * 60 * 60 * 1000,
  });
  if (!borrowedObj) {
    book.quantity += 1;
    book.availability = true;
    await book.save({ validateModifiedOnly: true });

    user.borrowedBooks.pop();
    await user.save({ validateModifiedOnly: true });
    throw new ApiError(500, "Failed to create borrowed object");
  }
  res.status(201).json(new ApiResponse(201, {}, "Book successfully Borrowed "));
});

export const returnBookByUser = asyncHandler(async (req, res) => {
  const { bookId, userId } = req.params;
  const user = await User.findOne({ _id: userId, accountVerified: true });
  const book = await Book.findById(bookId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (!book) {
    throw new ApiError(404, "Book not found");
  }
  const isBookBorrowed = await user.isBookBorrowed(bookId);
  if (!isBookBorrowed) {
    throw new ApiError(400, "User not borrowed this book");
  }
  const dueDate = await user.dueDate(bookId);
  const fine = calculateFine(dueDate);
  const amountToPay = book.price + fine;
  // amount payed successfully

  // 1. mark as returned in user.borrowedBooks()
  await user.markAsBookReturned(bookId);
  await user.save({ validateModifiedOnly: true });

  // 2. mark as returned in borrows model
  const borrowObj = await Borrow.findOne({ userId, bookId, returnDate: null });
  borrowObj.returnDate = today;
  if (fine) borrowObj.fine = fine;
  borrowObj.price = book.price;
  await borrowObj.save({ validateModifiedOnly: true });

  // 3. Increase quantity of Book
  book.quantity++;
  await book.save({ validateModifiedOnly: true });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Successfully returned book by paying INR ${amountToPay}`
      )
    );
});

export const getBorrowedBooksByUser = asyncHandler(async (req, res) => {});
export const getAllBorrowedBooksByUsers = asyncHandler(async (req, res) => {});
