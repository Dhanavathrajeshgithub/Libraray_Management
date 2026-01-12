import express from "express";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  bookAdd,
  deleteBook,
  getAllBooks,
} from "../controllers/book.controller.js";
const router = express.Router();

router.post("/admin/add", verifyJWT, isAuthorized("Admin"), bookAdd);
router.get("/all", verifyJWT, getAllBooks);
router.delete("/delete/:id", verifyJWT, isAuthorized("Admin"), deleteBook);
export default router;
