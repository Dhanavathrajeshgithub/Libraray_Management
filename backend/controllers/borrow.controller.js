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

  await user.save({ validateModifiedOnly: true });
  const borrowedObj = await Borrow.create({
    userId,
    price: book.price,
    bookId,
    borrowDate: Date.now(),
    dueDate: Date.now() + process.env.DUEDAYS * 24 * 60 * 60 * 1000,
  });
  if (!borrowedObj) {
    throw new ApiError(500, "Failed to create borrowed object");
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
  res.status(201).json(new ApiResponse(201, {}, "Book successfully Borrowed "));
});

export const returnBookByUser = asyncHandler(async (req, res) => {
  const { bookId, userId } = req.params;
  const user = await User.findOne({ _id: userId, accountVerified: true });
  const book = await Book.findById(bookId);
  const borrowObj = await Borrow.findOne({
    userId,
    bookId,
    returnDate: null,
  });
  let quantityIncreased = false;
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
  try {
    // 1. mark as returned in user.borrowedBooks()
    await user.markAsBookReturned(bookId);
    await user.save({ validateModifiedOnly: true });

    // 2. mark as returned in borrows model

    if (!borrowObj) {
      throw new ApiError(500, "Internal Server Error");
    }
    borrowObj.returnDate = Date.now();
    if (fine) borrowObj.fine = fine;
    await borrowObj.save({ validateModifiedOnly: true });

    // 3. Increase quantity of Book
    book.quantity++;
    book.availability = book.quantity > 0;
    await book.save({ validateModifiedOnly: true });
    quantityIncreased = true;
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          `Successfully returned book by paying INR ${amountToPay}`,
        ),
      );
  } catch (error) {
    if (user) {
      await user.markAsBookNotReturned(bookId);
      await user.save({ validateModifiedOnly: true });
    }

    if (borrowObj) {
      borrowObj.returnDate = null;
      borrowObj.fine = 0;
      await borrowObj.save({ validateModifiedOnly: true });
    }

    if (quantityIncreased) {
      book.quantity--;
      book.availability = book.quantity > 0;
      await book.save({ validateModifiedOnly: true });
    }
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Internal server error",
    );
  }
});

export const getBorrowedBooksByUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  if (!user) {
    throw new ApiError(400, "User is not logged in");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.borrowedBooks,
        "Successfully fetched borrowed books",
      ),
    );
});
export const getAllBorrowedBooksByUsers = asyncHandler(async (req, res) => {
  const borrowedBooks = await Borrow.find({});
  if (borrowedBooks.length == 0) {
    throw new ApiError(500, "Failed to get all borrowed books");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, borrowedBooks, "Sucessfully get all borrowed books"),
    );
});
