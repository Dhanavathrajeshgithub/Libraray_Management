import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginLimiter, loginUser);
export default router;
