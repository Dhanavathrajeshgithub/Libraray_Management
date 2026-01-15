import express from "express";
import {
  borrowBookByUser,
  getAllBorrowedBooksByUsers,
  getBorrowedBooksByUser,
  returnBookByUser,
} from "../controllers/borrow.controller.js";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/borrow/:bookId/:userId",
  verifyJWT,
  isAuthorized("Admin"),
  borrowBookByUser
);
router.get("/user/borrowed", verifyJWT, getBorrowedBooksByUser);
router.get(
  "/users/borrowed",
  verifyJWT,
  isAuthorized("Admin"),
  getAllBorrowedBooksByUsers
);
router.delete(
  "/return/:bookId/:userId",
  verifyJWT,
  isAuthorized("Admin"),
  returnBookByUser
);

export default router;
