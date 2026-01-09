import express from "express";
import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyOtp,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";
const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/get-user", verifyJWT, getUser);
router.post("/forgot-password", forgotPassword);
export default router;
