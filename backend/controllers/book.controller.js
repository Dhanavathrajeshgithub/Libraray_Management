import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Book } from "../models/book.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const bookAdd = asyncHandler(async (req, res) => {
  const { title, author, description, price, quantity } = req.body;
  if (!title || !author || !description || !price || !quantity) {
    throw new ApiError(400, "All fields are required");
  }

  const newBook = await Book.create({
    title,
    author,
    description,
    price,
    quantity,
  }); // Schema validates automatically

  if (!newBook) {
    throw new ApiError(500, "Failed to insert  ");
  }
  res
    .status(201)
    .json(new ApiResponse(201, newBook, "Book added successfully"));
});

export const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndDelete(id);
  if (!book) {
    throw new ApiError(404, "Book not found.");
  }
  res.json(new ApiResponse(200, {}, "Book deleted successfully"));
});

export const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({});
  if (!books) {
    throw new ApiError(500, "Failed to get all books");
  }
  res
    .status(200)
    .json(new ApiResponse(200, books, "Successfully fetched all books"));
});
